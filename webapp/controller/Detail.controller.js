sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/ObjectIdentifier",
	"sap/m/HBox",
	"sap/m/Input",
	"sap/m/MessageToast"
], function (JSONModel, Controller, ObjectIdentifier, HBox, Input, MessageToast) {
	"use strict";

	return Controller.extend("demo.controller.Detail", {
		
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();

			this.oRouter.getRoute("master").attachPatternMatched(this._onTableMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onTableMatched, this);
		},
		
		_onTableMatched: function (oEvent) {
			this._tableIndex = oEvent.getParameter("arguments").tableIndex || this._tableIndex || "0";
			this.getView().bindElement({
				path: "/TableMetadataCollection/" + this._tableIndex,
				model: "table_metadata"
			});
			
			this._table_name = this.getOwnerComponent().getModel('table_metadata').getProperty('/TableMetadataCollection/'+this._tableIndex+'/name');
			this.getView().bindElement({
				path: "/" + this._table_name,
				model: "table_data"
			});
		},

		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, tableIndex: this._tableIndex});
		},
		
		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, tableIndex: this._tableIndex});
		},
		
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {layout: sNextLayout});
		},
		
		
		/////////////////////////////////////////////////////////////////////////////////////////////////////////
		
		
		onSwitchEditable: function(oEvent){
			// switch button style
			var bCurrentlyEditable = (oEvent.getSource().getType() === 'Emphasized' ); 
			oEvent.getSource().setType(bCurrentlyEditable ? 'Transparent' : 'Emphasized');
			
			// set flag in model so switch table input field editable properties
			var oModel = this.getOwnerComponent().getModel('settings');
			oModel.setProperty('/table_editable', !bCurrentlyEditable);
		},
		
		onSwitchDeleteMode: function(oEvent){
			// switch button style
			var oTable = this.byId('simpleTable');
			var bCurrentlyDeleteMode = (oTable.getMode() === 'Delete' );
			oEvent.getSource().setType(bCurrentlyDeleteMode ? 'Transparent' : 'Emphasized');
			
			// switch table mode
			oTable.setMode(bCurrentlyDeleteMode ? 'None' : 'Delete');
		},
		
		onDelete: function(oEvent){
			// determine row to be deleted in model
			var oBindingContext = oEvent.getParameter('listItem').getBindingContext('table_data');
			var oRow = oBindingContext.getObject();
			
			// remove in model
			var aRows = this.getView().getBindingContext('table_data').getObject().rows;
			var iIndex = aRows.indexOf(oRow);
			aRows.splice(iIndex, 1);
			this.getView().getBindingContext('table_data').getModel().updateBindings();
		},

		onAdd: function(oEvent){
			this.byId('simpleTable').addRow();
		},
		
		onSave: function(oEvent){
			var mValidation = this.byId('simpleTable').validateContent();
			if(mValidation.missing > 0){
				MessageToast.show("Fill obligatory fields first. "+mValidation.missing+' non-nullable fields are currently empty.');
				return;
			}

			MessageToast.show('Validation successful. Saving could happen now.');
		},
		
		onReload: function(oEvent){
			// some fake waiting time, then reload table data from file
			var oTable = this.byId('simpleTable');
			oTable.setBusyIndicatorDelay(1);	
			oTable.setBusy(true);
			var oComponent = this.getOwnerComponent();
			setTimeout(function(){
				var oPromise = this.getView().getModel('table_data').loadData(oComponent.getManifest()["sap.app"].dataSources.table_data.uri);
				oPromise.then(function(){
				oTable.setBusy(false);
			});
				}.bind(this), 2000);

		}

	});
}, true);