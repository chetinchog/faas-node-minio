"use strict";

const Minio = require("minio");
const MinioClient = new Minio.Client({
  endPoint: "play.min.io",
  port: 9000,
  useSSL: true,
  accessKey: "Q3AM3UQ867SPQQA43P2F",
  secretKey: "zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG"
});

const init = async event => {
  try {
    const {
      body: { bucket, region }
    } = event;

    if (!bucket) {
      const listBuckets = await MinioClient.listBuckets();
      return {
        code: 200,
        msg: JSON.parse(JSON.stringify(listBuckets)).map(bucket => bucket.name)
      };
    }

    const exists = await MinioClient.bucketExists(bucket);
    if (exists) return { code: 400, msg: `Bucket "${bucket}" already exists!` };

    const response = await MinioClient.makeBucket(
      bucket,
      region || "us-east-1"
    );
    if (!response) return { code: 200, msg: `Bucket "${bucket}" created!` };
    else return { code: 400, msg: `Error!` };
  } catch (e) {
    console.log("TCL: e", e);
    return {
      code: 500,
      msg: e.code ? { code: e.code, errno: e.errno, syscall: e.syscall } : e
    };
  }
};

module.exports = async (event, context) => {
  const result = await init(event);
  if (result && result.code)
    context.status(result.code).succeed(JSON.parse(JSON.stringify(result.msg)));
  else context.succeed(result);
};
