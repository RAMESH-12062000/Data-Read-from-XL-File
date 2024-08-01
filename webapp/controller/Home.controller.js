sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("com.app.readdatafromxlfile.controller.Home", {
        onInit: function () {
            this.localModel = new JSONModel();
            this.getView().setModel(this.localModel, "localModel");
        },

        onUpload: function (e) {
            this._import(e.getParameter("files") && e.getParameter("files")[0]);
        },

        _import: function (file) {
            var that = this;
            var excelData = {};
            if (file && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = new Uint8Array(e.target.result);
                    var workbook = XLSX.read(data, {
                        type: 'array'
                    });
                    workbook.SheetNames.forEach(function (sheetName) {
                        // Here is your object for every sheet in workbook
                        excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    });
                    // Setting the data to the local model 
                    that.localModel.setData({
                        items: excelData
                    });
                    that.localModel.refresh(true);
                };
                reader.onerror = function (ex) {
                    console.log(ex);
                };
                reader.readAsArrayBuffer(file);
            }
        },
        onClearPressData: function () {
            this.localModel.setData();
        }
    });
});
