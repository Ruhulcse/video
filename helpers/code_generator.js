module.exports.generateCode = () => {
  // Create a new Date object for the current date and time
  const now = new Date();

  // Format the date and time components to ensure they are in the desired format
  // PadStart ensures that each component has at least two digits
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // +1 because getMonth() returns 0-11
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  // Construct the code string in the desired format
  const code = `#${year}${month}${day}${hour}${minute}`;

  return code;
};
