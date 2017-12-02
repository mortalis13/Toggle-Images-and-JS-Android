const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
Cu.import('resource://gre/modules/Services.jsm');

var button, menuImagesJS, menuImages, menuJS;

function loadIntoWindow(window) {
  addMenuItems(window)
}

function addMenuItems(window){
  var imagesState="[1]", jsState="[1]"
  
  if(!isImagesEnabled()) imagesState="[0]"
  if(!isJSEnabled()) jsState="[0]"
  
  var parentId=window.NativeWindow.menu.toolsMenuID
  menuImagesJS = window.NativeWindow.menu.add({
    name:"Toggle Images/JS",
    callback:function(){
      toggleImagesJS(window);
    },
    parent:parentId
  });
  
  menuImages = window.NativeWindow.menu.add({
    name:"Toggle Images "+imagesState,
    callback:function(){
      toggleImages(window);
    },
    parent:parentId
  });
  
  menuJS = window.NativeWindow.menu.add({
    name:"Toggle JS "+jsState,
    callback:function(){
      toggleJS(window);
    },
    parent:parentId
  });
}

function removeMenuItems(window){
  if (!window) return;
  window.NativeWindow.menu.remove(menuImagesJS);
  window.NativeWindow.menu.remove(menuImages);
  window.NativeWindow.menu.remove(menuJS);
}

function refreshMenuItems(window){
  removeMenuItems(window)
  addMenuItems(window)
}


function isImagesEnabled(){
  var pref="permissions.default.image"
  var curVal=Services.prefs.getIntPref(pref);
  
  if(curVal==2)
    return false
  return true
}

function isJSEnabled(){
  var pref="javascript.enabled"
  var curVal=Services.prefs.getBoolPref(pref);
  return curVal
}


function toggleImagesJS(window){
  toggleImages(window)
  toggleJS(window)
}

function toggleImages(window){
  var pref="permissions.default.image"
  var value=2
  var msg="Disabled"
  
  if(!isImagesEnabled()){
    value=1
    msg="Enabled"
  }
  
  Services.prefs.setIntPref(pref, value);
  refreshMenuItems(window)
  
  // window.NativeWindow.toast.show("Images "+msg, "short");
}

function toggleJS(window){
	var pref="javascript.enabled"
  var value=false
  var msg="Disabled"
  
  if(!isJSEnabled()){
    value=true
    msg="Enabled"
  }
  
  Services.prefs.setBoolPref(pref, value);
  refreshMenuItems(window)
  
  // window.NativeWindow.toast.show("JS "+msg, "short");
}


function unloadFromWindow(window) {
  removeMenuItems(window)
}

var windowListener = {
  onOpenWindow: function(aWindow) {
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("UIReady", function onLoad() {
      domWindow.removeEventListener("UIReady", onLoad, false);
      loadIntoWindow(domWindow);
    }, false);
  },
 
  onCloseWindow: function(aWindow) {},
  onWindowTitleChange: function(aWindow, aTitle) {}
};

function startup(aData, aReason) {
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }
  Services.wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  if (aReason == APP_SHUTDOWN) return;
  Services.wm.removeListener(windowListener);
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}
