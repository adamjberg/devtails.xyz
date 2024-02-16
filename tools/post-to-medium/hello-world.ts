async function run() {
  const userId = "153c9e8a4fdeb3740507f08ecb43235618c83250367c37b99460885d02a51c614";
  const token = "2fcb4f6bb4adbaf767eae7394a6b4a8823d167e202c6e99140c3b31747291c37e";
  const res = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      title: "Hello World",
      contentFormat: "markdown",
      content: "# Hello World\nTis just a draft",
      publishStatus: "draft"
    })
  });
  
  console.log(await res.json())
}

run();