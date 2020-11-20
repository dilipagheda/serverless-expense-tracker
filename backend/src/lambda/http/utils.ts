import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.IMAGES_S3_BUCKET

export async function deleteAttachment(attachmentUrl: string) {
  const segments = attachmentUrl.split('/')
  const imageId = segments[segments.length - 1]

  await s3
    .deleteObject({
      Bucket: bucketName,
      Key: imageId
    })
    .promise()
}
