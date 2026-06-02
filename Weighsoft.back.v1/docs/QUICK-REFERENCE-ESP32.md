# ESP32 Controls - Quick Reference

**Version:** 0.10.10  
**Last Updated:** December 17, 2025

## 🎯 Quick Summary

ESP32 boom and light controls are now managed at the **workstation level** with a **floating control panel**.

## 📍 Configuration Location

**Workstations Management** → Edit/Create Workstation → **ESP32 Boom & Light Control Settings**

Enter for each device:
- **IP Address** (e.g., `10.159.66.202`)
- **Relay Number** (1-8)

## 🎮 How to Use Controls

1. **Select workstation** in top navigation
2. **Click boom/light icon** in navbar (top-right)
3. **Floating panel opens** with available controls
4. **Click button** to control device

## 🔑 ESP32 Device Credentials

- **Username**: `admin`
- **Password**: `admin`

## 📋 Configuration Example

**One ESP32 controlling all 4 devices:**
```
Incoming Boom:  IP: 10.159.66.202, Relay: 1
Exiting Boom:   IP: 10.159.66.202, Relay: 2
Incoming Light: IP: 10.159.66.202, Relay: 3
Exiting Light:  IP: 10.159.66.202, Relay: 4
```

## 🧪 Test Button

In workstation configuration, click **Test** button next to each device to verify:
- Relay turns ON for 1 second
- Relay turns OFF
- Success/error notification appears

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Navbar button not showing | Select a workstation in top navigation |
| Device not responding | Check ESP32 power and WiFi connection |
| Test button fails | Verify IP address and relay number are correct |
| 404 error on API | Clear route cache: `php artisan route:clear` |

## 📖 Full Documentation

- **Main Docs**: `docs/05-integrations/ESP32-RELAY-INTEGRATION.md`
- **Feature Docs**: `docs/06-features/ESP32-WORKSTATION-CONTROLS.md`
- **Changelog**: `docs/CHANGELOG.md`

## 🔄 Migration from v0.10.4

If upgrading from v0.10.4 (weighbridge-level controls):

1. Backup database
2. Run migrations or SQL scripts (11, 12, 13)
3. Reconfigure ESP32 settings in **Workstations** (not weighbridges)
4. Test floating panel

## 📞 Support

**Architecture Question?** See `ESP32-RELAY-INTEGRATION.md`  
**Feature Question?** See `ESP32-WORKSTATION-CONTROLS.md`  
**Migration Issue?** See `ESP32-WORKSTATION-CONTROLS.md` → Migration Guide

