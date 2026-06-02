# QA Testing Message - WhatsApp Format

Copy and paste this message to QA:

---

🔧 **NEW FEATURE: ESP32 Boom & Light Control - Testing Required**

Hi QA Team,

Please test the new ESP32 boom and light control feature. Here's what to test:

**📋 TESTING CHECKLIST:**

**1. Weighbridge Configuration:**
   ✅ Go to Weighbridges setup
   ✅ Edit any weighbridge
   ✅ Verify you can see 4 new IP address fields:
      - Incoming Boom IP Address
      - Exiting Boom IP Address
      - Incoming Light IP Address
      - Exiting Light IP Address
   ✅ Enter test IP addresses (e.g., 192.168.1.100, 192.168.1.101, etc.)
   ✅ Save the weighbridge
   ✅ Verify IP addresses are saved correctly

**2. Weighing Create Screen:**
   ✅ Create a new weighing
   ✅ Select a weighbridge that has IP addresses configured
   ✅ Verify you see a "Boom & Light Control" panel with buttons:
      - Incoming Boom: Open / Close buttons
      - Exiting Boom: Open / Close buttons
      - Incoming Light: Green (Close) / Red (Open) buttons
      - Exiting Light: Green (Close) / Red (Open) buttons
   ✅ Click each button and verify:
      - Success message appears (toastr notification)
      - Loading indicator shows during request
      - Error message appears if IP is unreachable (expected if ESP32 not connected)

**3. Weighing Update Screen:**
   ✅ Open an existing weighing for editing
   ✅ Select a weighbridge with IP addresses configured
   ✅ Verify the same "Boom & Light Control" panel appears
   ✅ Test all buttons work correctly

**4. Edge Cases:**
   ✅ Select a weighbridge WITHOUT IP addresses configured
   ✅ Verify NO control panel appears (expected behavior)
   ✅ Try to save weighbridge with invalid IP format (should accept any text)
   ✅ Test with empty IP fields (should work, no panel shown)

**5. Version Check:**
   ✅ Check page title shows version 0.10.5
   ✅ Verify Frontend, Backend, and Connector versions all show 0.10.5

**⚠️ IMPORTANT NOTES:**
- If ESP32 devices are NOT connected, you'll see error messages when clicking buttons (this is EXPECTED)
- The feature sends HTTP POST requests to the IP addresses
- API endpoint: http://{ip}/rest/relayState
- Boom control: {"relay1": true} for Open, {"relay1": false} for Close
- Light control: {"relay1": true} for Green (Close/Safe), {"relay1": false} for Red (Open/Caution)

**🐛 REPORT ISSUES:**
If you find any problems, please report:
- What you were doing
- What you expected to happen
- What actually happened
- Screenshot if possible

**✅ PASS CRITERIA:**
- All IP fields save correctly
- Control panel appears only when IPs are configured
- All buttons trigger requests (even if devices offline)
- Success/error messages display correctly
- No JavaScript errors in console

Thanks! 🚀

---

