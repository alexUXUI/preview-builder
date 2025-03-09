import cf from "cloudfront";

const env = "prod";
const kvs = cf.kvs();

async function handler(event) {
  const request = event.request;
  const uri = request.uri;
  const segments = uri.split("/");

  // segments:
  //  0 = ''
  //  1 = 'hawaii|assets'
  //  2 = 'module|images'
  //  3 = 'version|filename'
  //  4 = '...'

  if (segments.length > 1) {
    if (segments[1] === "hawaii") {
      if (segments[2] === "hawaii-manifest.json") {
        request.uri = `/hawaii/products/${env}/hawaii-manifest.json`;
      }
      // if we point into the hawaii module, it's better to return "Not Found" instead of redirecting to index.html
      return request;
    }

    if (segments[1] === "assets") {
      if (segments[2] === "images") {
        // Handle assets/images path
        return request;
      }

      // if we point into the assets, it's better to return "Not Found" instead of redirecting to index.html
      if (segments.length > 4) {
        try {
          const override = await kvs.get(`${segments[2]}/${segments[3]}`);
          if (override) {
            return {
              statusCode: 302,
              statusDescription: "Found",
              headers: {
                location: {
                  value: `/assets/${override}/${segments.slice(4).join("/")}`,
                },
              },
            };
          }
        } catch (error) {
          // key not found -> do nothing
        }
      }

      return request;
    }
  }

  // only redirect to index.html if the request is not for an asset
  if (!uri.startsWith("/assets/")) {
    try {
      const override = await kvs.get("hawaii/shell");
      if (override) {
        request.uri = `/hawaii/shell/${override}/index.html`;
      }
    } catch (error) {
      // key not found -> do nothing
    }
  }

  return request;
}
