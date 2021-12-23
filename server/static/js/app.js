async function run() {
  const pathname = document.location.pathname;

  switch (pathname) {
    case "/":
      Home();
      break;
    default:
      Post();
      break;
  }
}

async function Home() {
  const res = await fetch("/api/posts");
  const jsonData = await res.json();
  const { data: posts } = jsonData;

  const root = document.getElementById("root");
  for (const post of posts) {
    const div = document.createElement("div");
    const linkEl = document.createElement("a");
    linkEl.setAttribute("href", `/posts/${post}`);
    linkEl.innerText = post;
    div.appendChild(linkEl);
    root.appendChild(div);
  }
}

async function Post() {
  const pathname = document.location.pathname;
  const apiPath = `/api${pathname}`;
  const res = await fetch(apiPath);
  const jsonData = await res.json();
  const { data: post } = jsonData;

  const root = document.getElementById("root");

  const textarea = document.createElement("textarea");
  textarea.style.display = "block";
  textarea.style.width = "100%";
  textarea.style.height = "90%";
  textarea.style.whiteSpace = "pre-wrap";
  textarea.innerHTML = post;


  textarea.addEventListener("drop", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const cursorPosition = e.target.selectionStart;

    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      const fd = new FormData();
      fd.append('image', file);

      const res = await fetch('/api/upload', {
          method: 'POST',
          body: fd
      });
      const { data: filename } = await res.json();

      const newText = `${textarea.value.substring(0, cursorPosition)}![](/assets/${filename})${textarea.value.slice(cursorPosition)}`
      textarea.value = newText;
    }
  });

  root.appendChild(textarea);

  const saveBtn = document.createElement("button");
  saveBtn.innerText = "Save";
  saveBtn.addEventListener("click", () => {
    fetch(apiPath, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        body: textarea.value,
      }),
    });
  });

  root.appendChild(saveBtn);
}

run();
