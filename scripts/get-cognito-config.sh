#!/bin/bash

# Script to get Cognito configuration from CloudFormation stack
# Usage: ./scripts/get-cognito-config.sh [stage]

STAGE=${1:-dev}
STACK_NAME="RentalAppAuthStack-${STAGE}"
REGION="us-west-2"

echo "================================================"
echo "Fetching Cognito Configuration"
echo "================================================"
echo "Stack: ${STACK_NAME}"
echo "Region: ${REGION}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if stack exists
if ! aws cloudformation describe-stacks --stack-name "${STACK_NAME}" --region "${REGION}" &> /dev/null; then
    echo "❌ Stack '${STACK_NAME}' not found in region '${REGION}'"
    echo ""
    echo "Available stacks:"
    aws cloudformation list-stacks --region "${REGION}" \
        --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
        --query 'StackSummaries[?contains(StackName, `Auth`)].StackName' \
        --output table
    exit 1
fi

echo "✅ Stack found. Fetching outputs..."
echo ""

# Get User Pool ID
USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${REGION}" \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text)

# Get Mobile Client ID
MOBILE_CLIENT_ID=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${REGION}" \
    --query 'Stacks[0].Outputs[?OutputKey==`MobileClientId`].OutputValue' \
    --output text)

# Get Web Client ID (for reference)
WEB_CLIENT_ID=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${REGION}" \
    --query 'Stacks[0].Outputs[?OutputKey==`WebClientId`].OutputValue' \
    --output text)

# Get Cognito Domain
COGNITO_DOMAIN=$(aws cloudformation describe-stacks \
    --stack-name "${STACK_NAME}" \
    --region "${REGION}" \
    --query 'Stacks[0].Outputs[?OutputKey==`CognitoDomain`].OutputValue' \
    --output text)

echo "================================================"
echo "Cognito Configuration"
echo "================================================"
echo ""
echo "User Pool ID:       ${USER_POOL_ID}"
echo "Mobile Client ID:   ${MOBILE_CLIENT_ID}"
echo "Web Client ID:      ${WEB_CLIENT_ID}"
echo "Cognito Domain:     ${COGNITO_DOMAIN}"
echo "Region:             ${REGION}"
echo ""

echo "================================================"
echo "Environment Variables for Mobile App (.env)"
echo "================================================"
echo ""
echo "# Cognito Configuration"
echo "EXPO_PUBLIC_USER_POOL_ID=${USER_POOL_ID}"
echo "EXPO_PUBLIC_MOBILE_CLIENT_ID=${MOBILE_CLIENT_ID}"
echo "EXPO_PUBLIC_REGION=${REGION}"
echo ""
echo "# Copy these to your .env file"
echo ""

# Optionally write to .env file
read -p "Do you want to update .env file? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ENV_FILE=".env"
    
    # Backup existing .env
    if [ -f "${ENV_FILE}" ]; then
        cp "${ENV_FILE}" "${ENV_FILE}.backup"
        echo "✅ Backed up existing .env to .env.backup"
    fi
    
    # Update or append values
    if [ -f "${ENV_FILE}" ]; then
        # Update existing values
        sed -i.tmp "s/^EXPO_PUBLIC_USER_POOL_ID=.*/EXPO_PUBLIC_USER_POOL_ID=${USER_POOL_ID}/" "${ENV_FILE}"
        sed -i.tmp "s/^EXPO_PUBLIC_MOBILE_CLIENT_ID=.*/EXPO_PUBLIC_MOBILE_CLIENT_ID=${MOBILE_CLIENT_ID}/" "${ENV_FILE}"
        sed -i.tmp "s/^EXPO_PUBLIC_REGION=.*/EXPO_PUBLIC_REGION=${REGION}/" "${ENV_FILE}"
        rm "${ENV_FILE}.tmp"
        
        # Add if not exists
        grep -q "^EXPO_PUBLIC_USER_POOL_ID=" "${ENV_FILE}" || echo "EXPO_PUBLIC_USER_POOL_ID=${USER_POOL_ID}" >> "${ENV_FILE}"
        grep -q "^EXPO_PUBLIC_MOBILE_CLIENT_ID=" "${ENV_FILE}" || echo "EXPO_PUBLIC_MOBILE_CLIENT_ID=${MOBILE_CLIENT_ID}" >> "${ENV_FILE}"
        grep -q "^EXPO_PUBLIC_REGION=" "${ENV_FILE}" || echo "EXPO_PUBLIC_REGION=${REGION}" >> "${ENV_FILE}"
    else
        # Create new .env file
        cat > "${ENV_FILE}" << EOF
# Cognito Configuration
EXPO_PUBLIC_USER_POOL_ID=${USER_POOL_ID}
EXPO_PUBLIC_MOBILE_CLIENT_ID=${MOBILE_CLIENT_ID}
EXPO_PUBLIC_REGION=${REGION}

# AppSync Configuration (update these manually)
EXPO_PUBLIC_GRAPHQL_ENDPOINT=https://xxxxx.appsync-api.${REGION}.amazonaws.com/graphql
EXPO_PUBLIC_API_KEY=da2-xxxxxxxxxxxxx
EOF
    fi
    
    echo "✅ Updated ${ENV_FILE}"
    echo ""
    echo "⚠️  Don't forget to update EXPO_PUBLIC_GRAPHQL_ENDPOINT and EXPO_PUBLIC_API_KEY"
fi

echo ""
echo "================================================"
echo "Next Steps"
echo "================================================"
echo ""
echo "1. Update your .env file with the values above"
echo "2. Restart your Expo development server"
echo "3. Test authentication flows"
echo ""
echo "For more information, see MOBILE_AUTH_SETUP.md"
echo ""
