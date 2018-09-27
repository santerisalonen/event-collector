source config

STAGE=${1:-dev}

if [ $STAGE == "prod" ]; then
  BUCKET=$PROJECT_NAME
else
  BUCKET=${PROJECT_NAME}-${STAGE}
fi


aws s3api create-bucket --bucket $BUCKET --region $REGION --acl public-read --create-bucket-configuration LocationConstraint=$REGION

set -e

npm install

node minify

aws s3 cp dist/mt.min.js s3://${BUCKET} --region $REGION --acl public-read

echo "https://s3-${REGION}.amazonaws.com/${BUCKET}/mt.min.js"