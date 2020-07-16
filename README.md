# Check if results are ready from https://wv.getmycovidresult.com

Simple script to check if results are ready from https://wv.getmycovidresult.com.  Once
they are ready an SMS will be sent to the configured number.  Health check SMSes
are also sent out at a regular interval to ensure that the process is still running.

This is possible since the endpoint webapp is developed against doesn't validate that a captcha was performed on the server side.  This has the potential to be abused but it
was useful for myself to avoid constantly checking the site.

## Usage

1. Install deps `yarn install` or `npm install`
2. Configure .env by copying .env.sample and then updating with your information
3. Ensure AWS credentials are avaible in a place that the aws-sdk can read them from
4. Run it with `yarn run exec`

