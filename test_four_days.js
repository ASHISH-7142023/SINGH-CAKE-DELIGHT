async function run() {
  const response = await fetch("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerName: "Four Day Customer",
      customerPhone: "9876543210",
      cakeName: "Strawberry Custom Cake",
      cakeImage: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
      notes: "Custom test order notes",
      pickupDate: "2026-06-27",
      pickupTime: "11:30",
      customImage: null,
      customChanges: null
    })
  });
  const data = await response.json();
  console.log("Response Status:", response.status);
  console.log("Response Data:", JSON.stringify(data, null, 2));
}
run();
