# SPACE Lab website

Official website concept and static implementation for SPACE Lab at the School of
Electrical and Electronic Engineering, Nanyang Technological University.

## Search indexing

The production site is `https://ntu-space-lab.github.io/`. Canonical URLs,
Open Graph metadata, structured data, `robots.txt`, and `sitemap.xml` use this
domain.

To connect Google Search Console after deployment:

1. Add the URL-prefix property `https://ntu-space-lab.github.io/` in Search Console.
2. Choose the HTML-tag verification method and copy the generated
   `google-site-verification` meta tag into the `<head>` of `index.html`, or use
   the HTML-file method and place Google's verification file at the repository root.
3. Deploy the verification change and complete verification in Search Console.
4. Submit `https://ntu-space-lab.github.io/sitemap.xml` under **Sitemaps**.
5. Inspect the home page URL and request indexing after the deployed metadata is live.
