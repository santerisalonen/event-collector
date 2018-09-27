
PROJECT_NAME=mehi-collect-api

STAGE=${1:-dev}

if [ $STAGE == "prod" ]; then
  BUCKET=$PROJECT_NAME
else
  BUCKET=${PROJECT_NAME}-${STAGE}
fi


aws s3api create-bucket --bucket $BUCKET --region $REGION --acl public-read --create-bucket-configuration LocationConstraint=$REGION

set -e

node minify

aws s3 cp dist/mt.min.js s3://${BUCKET} --region $REGION --acl public-read


echo "https://s3.amazonaws.com/${BUCKET}/mt.min.js"
