import fs from "fs";
import fm from "front-matter";

const filepath = process.argv[2];

async function run() {
  const postFileData = fs.readFileSync(filepath);

  const content = fm(postFileData.toString());

  const {
    title,
    permalink
  } = content.attributes as any;

  const token =
    "2fcb4f6bb4adbaf767eae7394a6b4a8823d167e202c6e99140c3b31747291c37e";

  const canonicalUrl = `https://devtails.xyz${permalink}`;
  const originallyPostedText = `*Originally published at [https://devtails.xyz](${canonicalUrl}).*`

  const res = await fetch(
    "https://api.medium.com/v1/publications/8c66334049e3/posts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        contentFormat: "markdown",
        content: `# ${title}\n${originallyPostedText}\n* * *\n${content.body}`,
        canonicalUrl,
        publishStatus: "draft",
      }),
    }
  );

  console.log(await res.json());
}

run();
