source config

# dev: sh deploy.sh
# prod: sh deploy.sh prod

STAGE=${1:-dev}
STACK_NAME=${PROJECT_NAME}-${STAGE}
BUILD_BUCKET=${PROJECT_NAME}-build

# make bucket if does not exist
aws s3 mb s3://${BUILD_BUCKET} --region $REGION

# halt execution if commands return non-zero exit code
# set -e

npm install

# make build dir for artifacts
rm -rf build
mkdir build
aws cloudformation package \
  --template-file template.yml \
  --output-template-file build/output.yml \
  --s3-bucket $BUILD_BUCKET

# Deploy
aws cloudformation deploy \
  --region $REGION \
  --template-file build/output.yml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides StackEnv=$STAGE FirehoseBufferMB=$FIREHOSE_BUFFER_MB FirehoseBufferSeconds=$FIREHOSE_BUFFER_SECONDS S3BucketExpirationDays=$S3_BUCKET_EXPIRATION_DAYS

API_ID=$(aws cloudformation describe-stacks --region ${REGION} --stack-name ${STACK_NAME} --query Stacks[0].Outputs[?OutputKey==\'ApiId\'].OutputValue --output text)
API_ENDPOINT="https://${API_ID}.execute-api.${REGION}.amazonaws.com/v1/collect"

BUCKET_NAME=$(aws cloudformation describe-stacks --region ${REGION} --stack-name ${STACK_NAME} --query Stacks[0].Outputs[?OutputKey==\'BucketName\'].OutputValue --output text)


# UPDATE API ALIAS
UPDATE_ALIAS=v1
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name $UPDATE_ALIAS \
  --region $REGION

# TEST
node test/test $API_ENDPOINT $BUCKET_NAME


echo "API endpoint: ${API_ENDPOINT}"