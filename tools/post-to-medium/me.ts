async function run() {
  const token = "2fcb4f6bb4adbaf767eae7394a6b4a8823d167e202c6e99140c3b31747291c37e";
  const res = await fetch("https://api.medium.com/v1/me", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  
  console.log(await res.json())
}

run();