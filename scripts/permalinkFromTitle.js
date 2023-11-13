const title = process.argv[2];

if (title) {
  const lowercaseTitle = title.toLowerCase();

  const formattedTitle = lowercaseTitle.replace(/\s+/g, "-");

  console.log(formattedTitle);
} else {
  console.log("Please provide a title as a command-line argument.");
}
