# DG Clean Exteriors — Netlify handoff

## Upload this package

1. Sign in at [Netlify](https://app.netlify.com/).
2. Create a new project by importing this folder through GitHub. This is the recommended path because every future update can publish automatically.
3. If you do not want to use GitHub, go to [Netlify Drop](https://app.netlify.com/drop) and upload the `dg-clean-exteriors-netlify.zip` file while signed in.
4. Netlify will use the included build command automatically. If it asks, use `npm run build` for the build command and `.next` for the publish directory.

## Connect your domain

After the first deploy, open **Domain management** in Netlify and add the domain you purchase. Netlify will show the exact DNS records to add at your domain registrar. Set the `www` version to redirect to the primary domain.

## Before turning on live quote delivery

The current builder creates the customer-ready project brief and opens it for sending. To make leads land in email or a CRM automatically, choose the receiving email, the owner notification format, and whether customers should receive an auto-reply. Those decisions are captured in the owner questions.

## Important

Do not upload `node_modules`, `.next`, `.wrangler`, or any `.env` file. The attached package excludes those files.
