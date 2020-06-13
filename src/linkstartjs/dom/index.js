'use strict';

function LinksStartJsDomUtil() {}

LinksStartJsDomUtil.render = function(page) {
  let frag = document.createRange().createContextualFragment(page.getHtml());
  return frag;
}

LinksStartJsDomUtil.applyActionBindings = function(page, actionInstance) {

  let actionableElements = page.getActionableElements();
  if (typeof actionableElements === 'undefined' || actionableElements.length == 0) {
    return;
  }

  actionableElements.forEach(function(actionableElement) {
    let tagId = actionableElement.tagId;
    let lsId = actionableElement.lsId;

    if (tagId && lsId) {
      let domElement = getElementByLsId(lsId);
      let onclickFunction = getDefaultActionForElement(actionInstance, tagId);
      if (domElement && onclickFunction) {
        domElement.onclick = onclickFunction;
      }
    }
  });

}

LinksStartJsDomUtil.applyModelBindings = function(page) {

  var model = {};

  let modelElements = page.getModelElements();
  if (typeof modelElements === 'undefined' || modelElements.length == 0) {
    return;
  }

  modelElements.forEach(function(modelElement) {
    let tagId = modelElement.tagId;
    let lsId = modelElement.lsId;

    if (tagId && lsId) {
      let domElement = getElementByLsId(lsId);
      if (domElement.tagName === 'INPUT') {

        domElement.addEventListener("change", function(event) {
          if(domElement.type === 'text'){
            model[tagId] = event.target.value;
          }else if(domElement.type === 'radio'){
            model[domElement.name] = event.target.value;
          }else if(domElement.type === 'checkbox'){
            if(domElement.checked === true){
              model[tagId] = true;
            }else{
              model[tagId] = false;
            }
          }
        });
        //set default value

        if(domElement.type === 'text'){
          model[tagId] = domElement.value;
        }else if(domElement.type === 'radio'){
          let radioValue = getDefaultRadioValue(domElement);
          if(typeof radioValue !== 'undefined'){
            model[domElement.name] = radioValue;
          }
        }else if(domElement.type === 'checkbox'){
          let checkboxValue = getDefaultCheckboxValue(domElement);
          model[tagId] = checkboxValue;
        }

      } else if (domElement.tagName === 'SELECT') {
        domElement.addEventListener("change", function(event) {
          model[tagId] = event.target.value;
        });
        //set default value
        model[tagId] = getDefaultSelectValue(domElement);
      } else {
        console.log("Model binding is not implemented yet:" + domElement.tagName);
      }
    }
  });

  return model;
}

LinksStartJsDomUtil.getModelElementById = function(page, id) {

  var model = {};

  let modelElements = page.getModelElements();
  if (typeof modelElements === 'undefined' || modelElements.length == 0) {
    return;
  }

  var element;

  for (let modelElement of modelElements) {
    let tagId = modelElement.tagId;
    let lsId = modelElement.lsId;
    if ((tagId && lsId) && tagId == id) {
      element = getElementByLsId(lsId);
      break;
    }
  }

  return element;
}


function getDefaultCheckboxValue(checkboxElement) {
  if(checkboxElement.checked === true){
    return true;
  }else{
    return false;
  }
}

function getDefaultRadioValue(radioElement) {
  if(radioElement.checked === true){
    return radioElement.value;
  }
}

function getDefaultSelectValue(selectElement) {
  var myOptions = selectElement.options;
  for (var i = 0; i < myOptions.length; i++) {
    var isDefSelected = myOptions[i].selected;
    if (isDefSelected) {
      return myOptions[i].value;
    }
  }
}

function getElementByLsId(lsId) {
  let list = document.querySelectorAll('[ls-id="' + lsId + '"]');
  if (list.length == 1) {
    return list[0];
  } else {
    console.log("There are not any element or there are more than one:" + lsId);
  }
}

function getDefaultActionForElement(actionInstance, tagId) {

  let objectPropertyNames = Object.getOwnPropertyNames(actionInstance);

  for (let objectPropertyName of objectPropertyNames) {
    if (typeof actionInstance[objectPropertyName] !== 'function') {
      continue;
    }
    if (objectPropertyName.startsWith(tagId)) {
      return actionInstance[objectPropertyName];
    }
  }
}

module.exports = LinksStartJsDomUtil;
