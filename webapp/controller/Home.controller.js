sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Input",
    "sap/m/Text",
    "sap/m/Table",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Column, ColumnListItem, Input, Text, Table, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("com.app.readdatafromxlfile.controller.Home", {
        onInit: function () {
            this.localModel = new JSONModel();
            this.getView().setModel(this.localModel, "localModel");
            this.bEditMode = false; // Edit mode flag
        },

        onUpload: function (e) {
            this._import(e.getParameter("files") && e.getParameter("files")[0]);
        },

        _import: function (file) {
            var that = this;
            var excelData = [];
            if (file && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = new Uint8Array(e.target.result);
                    var workbook = XLSX.read(data, {
                        type: 'array'
                    });
                    workbook.SheetNames.forEach(function (sheetName) {
                        excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    });

                    that.localModel.setData({
                        items: excelData
                    });
                    that.localModel.refresh(true);

                    that.createTable(excelData);
                };
                reader.onerror = function (ex) {
                    console.log(ex);
                };
                reader.readAsArrayBuffer(file);
            }
        },

        //Dynamically Created Table by using Table ID==>"idDynamicTable", which is need to be added at table creation in View
        createTable: function (data) {
            var oTable = this.byId("idDynamicTable");
            oTable.destroyColumns();
            oTable.destroyItems();

            if (data.length > 0) {
                var firstItem = data[0];
                for (var key in firstItem) {
                    if (firstItem.hasOwnProperty(key)) {
                        oTable.addColumn(new Column({
                            header: new Text({ text: key })
                        }));
                    }
                }

                var oTemplate = new ColumnListItem({
                    cells: Object.keys(firstItem).map(function (key) {
                        return this.bEditMode ? new Input({ value: "{localModel>" + key + "}" }) : new Text({ text: "{localModel>" + key + "}" });
                    }.bind(this))
                });

                oTable.bindItems({
                    path: "localModel>/items",
                    template: oTemplate
                });
            }
        },

        //when when dynamically created a Table...
        onClear: function () {
            this.localModel.setData({ items: [] });
            var oTable = this.byId("idDynamicTable");
            oTable.destroyItems();
            oTable.destroyColumns();
            MessageToast.show("Items Cleared..")
        },
        //you need create a tableStructure in view..
        // onClearPressData: function () {
        //     this.localModel.setData();
        // },

        onEditPressBtn: function () {
            this.bEditMode = !this.bEditMode; // Toggle edit mode
            var data = this.localModel.getData().items;
            this.createTable(data); // Recreate table with updated edit mode state
            this._toggleEditButtons(true);
        },

        onSaveBtnPress: function () {
            this.bEditMode = false; // Exit edit mode
            var data = this.localModel.getData().items;
            //console.log("Edited Data:", data); // Process or save this data as needed
            this.createTable(data); // Recreate table in view mode
            this._toggleEditButtons(false);
            MessageToast.show("Details Saved..")
        },

        onCancelBtnPress: function () {
            this.bEditMode = false; // Exit edit mode
            var data = this.localModel.getData().items;
            this.createTable(data); // Recreate table in view mode
            this._toggleEditButtons(false);
        },

        onAddBtnPress: function () {
            var data = this.localModel.getData().items;
            var newItem = {};

            if (data.length > 0) {
                Object.keys(data[0]).forEach(function (key) {
                    newItem[key] = ""; // Set default empty values for new item
                });
            }

            data.push(newItem);
            this.localModel.setProperty("/items", data);
            this.createTable(data); // Recreate table to reflect new row
            MessageToast.show("Row Added..")
        },

        //Here this calling when Edit btn pressed and True
        _toggleEditButtons: function (bEditMode) {
            this.byId("editButton").setVisible(!bEditMode);
            this.byId("saveButton").setVisible(bEditMode);
            this.byId("cancelButton").setVisible(bEditMode);
        },

        //When selecting a row and delete that one & refresh...
        onPressDeleteBtn: function () {
            var oTable = this.byId("idDynamicTable");
            var oSelectedItem = oTable.getSelectedItem();

            if (oSelectedItem) {
                var oPath = oSelectedItem.getBindingContextPath();
                var iIndex = parseInt(oPath.split("/").pop(), 10);

                var data = this.localModel.getData().items;
                data.splice(iIndex, 1);
                this.localModel.setProperty("/items", data); //here it will act like refresh function..
                this.createTable(data); // Recreate table to reflect deleted row..
                MessageBox.success("Seleted item Succefully Deleted..")
            }

            /** for Multiple Selections Use this...
            oTable.removeSelections();
            this.byId("idDeleteBtn").setEnabled(false); // Disable delete button */
        },
    });
});
