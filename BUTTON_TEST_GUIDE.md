# 🧪 Button Testing Guide

## ✅ All Buttons to Test

### 1. **Rename** Button
- **Expected**: Opens a modal popup with text input
- **Test**: Click button → Type new name → Submit
- **Success**: Channel name changes

### 2. **Lock** Button  
- **Expected**: Locks channel (only owner/co-owners can join)
- **Test**: Click button
- **Success**: Shows "🔒 Voice channel locked!" message

### 3. **Unlock** Button
- **Expected**: Unlocks channel (everyone can join)
- **Test**: Click button
- **Success**: Shows "🔓 Voice channel unlocked!" message

### 4. **Limit** Button
- **Expected**: Opens modal to set user limit
- **Test**: Click button → Enter number (0-99) → Submit
- **Success**: Channel user limit changes

### 5. **Reset** Button
- **Expected**: Resets all channel permissions
- **Test**: Click button
- **Success**: Shows "Permissions reset" message

### 6. **Permit** Button
- **Expected**: Opens user select menu (dropdown)
- **Test**: Click button → Select user from dropdown → Confirm
- **Success**: Shows "User permitted" message

### 7. **Blacklist** Button
- **Expected**: Opens user select menu (dropdown)
- **Test**: Click button → Select user from dropdown → Confirm
- **Success**: Shows "User blacklisted" message

### 8. **Hide** Button
- **Expected**: Hides channel from server list
- **Test**: Click button
- **Success**: Channel becomes invisible to non-members

### 9. **Info** Button
- **Expected**: Shows channel statistics
- **Test**: Click button
- **Success**: Shows embed with channel info

### 10. **Co-owners** Button
- **Expected**: Opens modal to manage co-owners
- **Test**: Click button → Enter user IDs/mentions → Submit
- **Success**: Shows "Co-owners updated" message

---

## 🔍 How to Test

1. **Join your JTC trigger channel**
   - Bot creates your personal voice channel
   - Sticky message with buttons appears in voice channel's text chat

2. **Click each button one by one**
   - Note what happens
   - Check for errors in console

3. **Expected Behaviors**:
   - **Modals** (Rename, Limit, Co-owners): Popup form appears
   - **Direct Actions** (Lock, Unlock, Reset, Hide, Info): Immediate response
   - **Select Menus** (Permit, Blacklist): Dropdown menu appears

---

## ❌ Common Issues

### "Voice channel not found"
- **Cause**: Button handler can't find voice channel
- **Fixed**: ✅ Already patched in latest update

### "Unknown interaction" 
- **Cause**: Interaction took too long to respond
- **Fixed**: ✅ Error handling improved

### "Interaction already acknowledged"
- **Cause**: Trying to respond twice
- **Fixed**: ✅ Modal handling fixed

---

## 📊 Test Results Template

```
✅ Rename: Works
✅ Lock: Works
✅ Unlock: Works
✅ Limit: Works
✅ Reset: Works
✅ Permit: Works
✅ Blacklist: Works
✅ Hide: Works
✅ Info: Works
✅ Co-owners: Works
```

---

## 🐛 Report Issues

If a button doesn't work:
1. Note which button
2. Copy the error from console
3. Describe what happened vs what should happen
