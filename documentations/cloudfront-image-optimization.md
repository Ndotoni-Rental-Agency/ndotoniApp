# CloudFront Image Loading Optimization Guide

## Problem
Images from CloudFront are loading slower than expected compared to other internet sources.

## Root Causes

### 1. Cache Configuration
- CloudFront cache behaviors may not be optimized
- Missing or incorrect cache headers from S3
- Short TTL (Time To Live) values

### 2. Image Optimization
- Images not compressed
- No WebP format support
- No responsive image sizes
- Large file sizes

### 3. Geographic Distribution
- CloudFront edge locations not properly configured
- Origin shield not enabled

## Solutions

### Frontend Optimizations (Implemented)

#### 1. Use expo-image with Caching
✅ **Implemented in `PropertyMediaGallery.tsx`**

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  contentFit="cover"
  transition={300}
  cachePolicy="memory-disk"
/>
```

Benefits:
- Automatic memory and disk caching
- Progressive loading
- Better performance than React Native Image

#### 2. Implement Progressive Loading
Add placeholder/blur while loading:

```typescript
<Image
  source={{ uri: imageUrl }}
  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
  contentFit="cover"
  transition={300}
/>
```

#### 3. Preload Critical Images
For property cards, preload thumbnails:

```typescript
import { Image } from 'expo-image';

// Preload images
await Image.prefetch(imageUrls);
```

### Backend Optimizations (Required)

#### 1. CloudFront Cache Behaviors

**Recommended Settings:**
```json
{
  "PathPattern": "images/*",
  "TargetOriginId": "S3-ndotoni-media",
  "ViewerProtocolPolicy": "redirect-to-https",
  "AllowedMethods": ["GET", "HEAD", "OPTIONS"],
  "CachedMethods": ["GET", "HEAD"],
  "Compress": true,
  "MinTTL": 86400,
  "DefaultTTL": 2592000,
  "MaxTTL": 31536000,
  "ForwardedValues": {
    "QueryString": false,
    "Cookies": {
      "Forward": "none"
    },
    "Headers": ["Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"]
  }
}
```

#### 2. S3 Bucket Configuration

**Add Cache-Control Headers:**
```bash
aws s3 cp s3://your-bucket/images/ s3://your-bucket/images/ \
  --recursive \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=31536000, immutable"
```

**Or in Lambda@Edge:**
```javascript
exports.handler = async (event) => {
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  headers['cache-control'] = [{
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable'
  }];

  return response;
};
```

#### 3. Image Optimization with Lambda@Edge

**Create Image Optimization Function:**

```javascript
const sharp = require('sharp');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;
  
  // Parse query parameters for width, quality, format
  const params = new URLSearchParams(request.querystring);
  const width = parseInt(params.get('w') || '800');
  const quality = parseInt(params.get('q') || '80');
  const format = params.get('f') || 'webp';
  
  // Get original image from S3
  const s3Object = await s3.getObject({
    Bucket: 'your-bucket',
    Key: uri.substring(1)
  }).promise();
  
  // Optimize image
  const optimized = await sharp(s3Object.Body)
    .resize(width, null, { withoutEnlargement: true })
    .toFormat(format, { quality })
    .toBuffer();
  
  return {
    status: '200',
    statusDescription: 'OK',
    headers: {
      'content-type': [{ value: `image/${format}` }],
      'cache-control': [{ value: 'public, max-age=31536000' }],
    },
    body: optimized.toString('base64'),
    bodyEncoding: 'base64'
  };
};
```

#### 4. Enable Origin Shield

```bash
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --origin-shield-enabled \
  --origin-shield-region us-east-1
```

Benefits:
- Reduces load on S3
- Improves cache hit ratio
- Better performance globally

#### 5. Use CloudFront Functions for URL Rewriting

**Automatic WebP Conversion:**
```javascript
function handler(event) {
  var request = event.request;
  var headers = request.headers;
  var uri = request.uri;
  
  // Check if browser supports WebP
  var accept = headers.accept ? headers.accept.value : '';
  
  if (accept.includes('image/webp')) {
    // Rewrite to WebP version
    uri = uri.replace(/\.(jpg|jpeg|png)$/, '.webp');
  }
  
  request.uri = uri;
  return request;
}
```

### Monitoring & Testing

#### 1. Test Cache Hit Ratio
```bash
# Check CloudFront headers
curl -I https://your-cloudfront-domain.com/images/test.jpg

# Look for:
# X-Cache: Hit from cloudfront
# Age: 3600
```

#### 2. Measure Performance
```typescript
// In your app
const startTime = Date.now();
await Image.prefetch(imageUrl);
const loadTime = Date.now() - startTime;
console.log(`Image loaded in ${loadTime}ms`);
```

#### 3. CloudWatch Metrics
Monitor:
- Cache hit rate
- Origin latency
- 4xx/5xx error rates
- Bytes downloaded

### Quick Wins (Immediate Actions)

1. ✅ **Frontend**: Use expo-image (Already implemented)
2. **Backend**: Enable CloudFront compression
3. **Backend**: Set proper cache headers on S3
4. **Backend**: Enable Origin Shield
5. **Backend**: Implement image optimization Lambda

### Long-term Improvements

1. **Implement responsive images**
   - Generate multiple sizes (thumbnail, medium, large)
   - Use srcset in frontend

2. **Convert to WebP/AVIF**
   - Smaller file sizes
   - Better compression
   - Automatic format selection

3. **Lazy loading**
   - Load images as user scrolls
   - Reduce initial load time

4. **CDN Optimization**
   - Review edge location coverage
   - Consider multi-CDN strategy

### Cost Considerations

- Lambda@Edge: ~$0.60 per 1M requests
- CloudFront: ~$0.085 per GB (first 10TB)
- Origin Shield: ~$0.01 per 10,000 requests
- S3: ~$0.023 per GB storage

### Implementation Priority

1. **High Priority** (Do Now)
   - Enable CloudFront compression ✅
   - Set cache headers on S3
   - Use expo-image (done)

2. **Medium Priority** (This Week)
   - Enable Origin Shield
   - Implement basic image optimization

3. **Low Priority** (Next Sprint)
   - Advanced image optimization
   - WebP conversion
   - Responsive images

## Testing Checklist

- [ ] Verify CloudFront cache headers
- [ ] Test image load times
- [ ] Check cache hit ratio
- [ ] Monitor CloudWatch metrics
- [ ] Test on slow network (3G)
- [ ] Verify compression is working
- [ ] Test WebP support

## Resources

- [CloudFront Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/best-practices.html)
- [Lambda@Edge Examples](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html)
- [expo-image Documentation](https://docs.expo.dev/versions/latest/sdk/image/)
