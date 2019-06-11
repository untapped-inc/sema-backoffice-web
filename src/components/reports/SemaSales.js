import React, { Component } from 'react';
import '../../App.css';
import '../../css/SemaSales.css';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as healthCheckActions from '../../actions/healthCheckActions';
import { withRouter } from 'react-router'
import SemaServiceError from "../SeamaServiceError";
import SemaDatabaseError from "../SeamaDatabaseError";
import SalesSummaryPanel1 from "./Sales/SalesSummaryPanel1";
// import SalesSummaryPanel2 from "./Sales/SalesSummaryPanel2";
import SalesMapContainer from './Sales/SalesMapContainer';
import SalesRetailerList from './Sales/SalesRetailerList';
import * as salesActions from '../../actions/SalesActions';
import SalesByChannelChart from "./Sales/SalesByChannelChart";
import SalesByChannelTimeChart from "./Sales/SalesByChannelTimeChart";
import LoadProgress from "../LoadProgress";
import { utilService } from '../../services';
import { productsHashSelector, usersHashSelector } from '../../reducers/selectors';
import moment from 'moment';
import {
	TreeDataState,
  	CustomTreeData,
  } from '@devexpress/dx-react-grid';
import {
	Grid,
	VirtualTable,
	TableHeaderRow,
	TableTreeColumn,
	TableColumnResizing,
	TableFixedColumns
} from '@devexpress/dx-react-grid-bootstrap3';

let dateFormat = require('dateformat');

class SemaSales extends Component {
	constructor(props, context) {
		super(props, context);
		console.log("SeamaSales - Constructor");

		this.state = {
			columns: [
				{ title: 'ID', name: 'id' },
				{ title: 'Created Date', name: 'created_at', getCellValue: d => (moment(d.created_at).local().format("YYYY-MM-DD hh:mm:ss a")) },
				{ title: 'Updated Date', name: 'updated_at', getCellValue: d => (moment(d.updated_at).local().format("YYYY-MM-DD hh:mm:ss a")) },
				{ title: 'Customer Name', name: 'customer_account_id', getCellValue: c => {
					if (!this.props.sales.salesInfo.customersHash)
						return '';
					const customer = this.props.sales.salesInfo.customersHash[c.customer_account_id];
					return customer ? customer.name : '';
				} },
				{ title: 'Product SKU', name: 'product_id', getCellValue: p => {
					if (!this.props.productsHash)
						return '';
					const product = this.props.productsHash[p.product_id];
					return product ? product.name : '';
				} },
				{ title: 'Quantity', name: 'quantity' },
				{ title: 'Amount Cash', name: 'amount_cash' },
				{ title: 'Amount Mobile', name: 'amount_mobile' },
				{ title: 'Amount Card', name: 'amount_card' },
				{ title: 'Amount Loan', name: 'amount_loan' },
				{ title: 'Payment Type', name: 'payment_type' },
				{ title: 'Unit Price', name: 'unit_price' },
				{ title: 'Total Price', name: 'total_price' },
				{ title: 'COGS Per Unit', name: 'cogs_amount' },
				{ title: 'Total COGS', name: 'total_cogs' },
				{ title: 'Entered By', name: 'user_id', getCellValue: u => {
					if (!this.props.usersHash)
						return '';
					const user = this.props.usersHash[u.user_id];
					return user ? user.firstName + ' ' + user.lastName : '';
				} },
				{ title: 'Status', name: 'active' }
			],
			defaultColumnWidths: [
				{ columnName: 'id', width: 180 },
				{ columnName: 'created_at', width: 180 },
				{ columnName: 'updated_at', width: 180 },
				{ columnName: 'customer_account_id', width: 180 },
				{ columnName: 'product_id', width: 120 },
				{ columnName: 'quantity', width: 120 },
				{ columnName: 'amount_cash', width: 120, align: 'right' },
				{ columnName: 'amount_mobile', width: 120 },
				{ columnName: 'amount_card', width: 120 },
				{ columnName: 'amount_loan', width: 120 },
				{ columnName: 'payment_type', width: 120 },
				{ columnName: 'unit_price', width: 120 },
				{ columnName: 'total_price', width: 120 },
				{ columnName: 'cogs_amount', width: 120 },
				{ columnName: 'total_cogs', width: 120 },
				{ columnName: 'user_id', width: 120 },
				{ columnName: 'active', width: 120 }
			],
			tableColumnExtensions: [
				{ columnName: 'quantity', align: 'right' },
				{ columnName: 'amount_cash', align: 'right' },
				{ columnName: 'amount_mobile', align: 'right' },
				{ columnName: 'amount_card', align: 'right' },
				{ columnName: 'amount_loan', align: 'right' },
				{ columnName: 'unit_price', align: 'right' },
				{ columnName: 'total_price', align: 'right' },
				{ columnName: 'cogs_amount', align: 'right' },
				{ columnName: 'total_cogs', align: 'right' },
			],
			leftColumns: ['id'],
		};
	}

	render() {
		return this.showContent();
	}

	showContent(props){
		if( this.props.healthCheck.server !== "Ok" ){
			return SemaServiceError(props);
		}else  if( this.props.healthCheck.database !== "Ok" ){
			return SemaDatabaseError(props)
		}
		return this.showSales();

	}

	showSales(){
		return (
			<React.Fragment>
				<div className="SalesProgress">
					<LoadProgress/>
				</div>

				<div className="SalesContainer">
					<div className = "SalesSummaryContainer">
						<div className ="SalesSummaryItem">
							<SalesSummaryPanel1 title="Total Customers" date={this.getDateSince(this.props.sales.salesInfo.totalCustomers)}
												value={formatTotalCustomers(this.props.sales.salesInfo)}
												delta = {calcCustomerDelta( this.props.sales.salesInfo) }
												valueColor = {calcColor(this.props.sales.salesInfo.totalCustomers.periods[0].value, this.props.sales.salesInfo.totalCustomers.periods[1].value)} />
						</div>
						<div className ="SalesSummaryItem">
							<SalesSummaryPanel1 title="Total Revenue" date={this.getDateSince(this.props.sales.salesInfo.totalRevenue)}
												value={utilService.formatDollar(this.props.sales.salesInfo.currencyUnits, this.props.sales.salesInfo.totalRevenue.total)}
												delta = {calcRevenueDelta(this.props.sales.salesInfo)}
												valueColor = {calcColor(this.props.sales.salesInfo.totalRevenue.periods[0].value, this.props.sales.salesInfo.totalRevenue.periods[1].value)} />
						</div>
						<div className ="SalesSummaryItem">
							<SalesSummaryPanel1 title="Gross Margin" date={this.getDateSince(this.props.sales.salesInfo.totalRevenue)}
												value={calcNetRevenue( this.props.sales.salesInfo )}
												delta = {calcNetRevenueDelta(this.props.sales.salesInfo)}
												valueColor = {calcNetRevenueColor(this.props.sales.salesInfo)} />
						</div>
					</div>
					<div className = "SalesContentContainer">
						<div className= "SalesMapItem" id="salesMapId">
							<SalesMapContainer google={this.props.google} retailers={this.props.sales.salesInfo.customerSales} kiosk={this.props.kiosk} />
						</div>
						<div className= "SalesListItem">
							<div><p style={{textAlign:"center"}}>{formatRetailSalesHeader(this.props.sales.salesInfo.customerSales)}</p></div>
							<SalesRetailerList retailers={this.props.sales.salesInfo.customerSales}/>
						</div>
						<div className= "SalesBottomContainer">
							<div className= "SalesBottomRight">
								<SalesByChannelTimeChart chartData={this.props.sales}/>
								{/*<SalesSummaryPanel2 title="Revenue/Customer"*/}
													{/*value={ formatRevenuePerCustomer(this.props.sales.salesInfo)}*/}
													{/*valueColor = "rgb(24, 55, 106)"*/}
													{/*title2 = {formatNoOfCustomers(this.props.sales.salesInfo)} />*/}
							</div>
							<div className= "SalesBottomLeft">
								<SalesByChannelChart chartData={this.props.sales}/>
							</div>
						</div>
						<div className="SalesTableContainer">
							<Grid
								rows={this.props.sales.salesInfo.receipts}
								columns={this.state.columns}
								>
								<TreeDataState />
								<CustomTreeData
									getChildRows={(row, rootRows) => (row ? row.children : rootRows)}
								/>
								<VirtualTable columnExtensions={this.state.tableColumnExtensions} />
								<TableColumnResizing defaultColumnWidths={this.state.defaultColumnWidths} />
								<TableHeaderRow />
								<TableTreeColumn
									for="id"
								/>
								<TableFixedColumns
									leftColumns={this.state.leftColumns}
								/>
							</Grid>
						</div>
					</div>
				</div>
			</React.Fragment>
		);
	}

	getDateSince( metric){
		if( metric.periods[1].beginDate != null ){
			switch( metric.period ){
				case "month":
					return " since " + dateFormat(convertDateToUTC(new Date(Date.parse(metric.periods[1].beginDate))), "mmm, yyyy");
				case "year":
					return " since " + dateFormat(convertDateToUTC(new Date( Date.parse(metric.periods[1].beginDate))), "yyyy");
				case "none":
				default:
					return "";
			}
		}else{
			return "N/A"
		}
	}

}

function convertDateToUTC(date) {
	return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

const calcNetRevenue = salesInfo =>{
	if( salesInfo.totalRevenue.total &&  salesInfo.totalCogs.total ){
		return utilService.formatDollar( salesInfo.currencyUnits, salesInfo.totalRevenue.total - salesInfo.totalCogs.total);
	}else{
		return "N/A";
	}
}

const calcNetRevenueDelta = salesInfo =>{
	if( salesInfo.totalRevenue.period === "none"){
		return "";
	}else {
		if (salesInfo.totalRevenue.periods[0].value && salesInfo.totalCogs.periods[0].value &&
			salesInfo.totalRevenue.periods[1].value && salesInfo.totalCogs.periods[1].value) {
			return calcChange(salesInfo, salesInfo.totalRevenue.periods[0].value - salesInfo.totalCogs.periods[0].value,
				salesInfo.totalRevenue.periods[1].value - salesInfo.totalCogs.periods[1].value)
		} else {
			return "N/A";
		}
	}
}
const calcCustomerDelta = salesInfo =>{
	if( salesInfo.totalCustomers.period === "none") {
		return "";
	}else{
		return calcChange(salesInfo, salesInfo.totalCustomers.periods[0].value, salesInfo.totalCustomers.periods[1].value);
	}
}
const calcRevenueDelta = salesInfo =>{
	if( salesInfo.totalRevenue.period === "none") {
		return "";
	}else{
		return calcChange(salesInfo, salesInfo.totalRevenue.periods[0].value, salesInfo.totalRevenue.periods[1].value);
	}
}

const calcNetRevenueColor = salesInfo =>{
	if( salesInfo.totalRevenue.periods[0].value &&  salesInfo.totalCogs.periods[0].value &&
		salesInfo.totalRevenue.periods[1].value &&  salesInfo.totalCogs.periods[1].value ){
		return calcColor( salesInfo.totalRevenue.periods[0].value - salesInfo.totalCogs.periods[0].value,
			       salesInfo.totalRevenue.periods[1].value - salesInfo.totalCogs.periods[1].value )
	}else{
		return "gray";
	}
}

const formatTotalCustomers = salesInfo =>{
	return ( salesInfo.totalCustomers.total ) ? salesInfo.totalCustomers.total : "N/A";
}

const formatRetailSalesHeader = (retailSales) =>{
	if( retailSales.length > 0 ){
		switch( retailSales[0].period){
			case "none":
				return "Total Sales";
			case "year":
				let startDate = dateFormat(convertDateToUTC(new Date(Date.parse(retailSales[0].periods[0].beginDate))), "mmm, yyyy");
				let endDate = dateFormat(convertDateToUTC(new Date(Date.parse(retailSales[0].periods[0].endDate))), "mmm, yyyy");
				return "Sales from " + startDate + " - " + endDate;
			case "month":
				startDate = dateFormat(convertDateToUTC(new Date(Date.parse(retailSales[0].periods[0].beginDate))), "mmm, d, yyyy");
				endDate = dateFormat(convertDateToUTC(new Date(Date.parse(retailSales[0].periods[0].endDate))), "mmm, d, yyyy");
				return "Sales from " + startDate + " - " + endDate;
			default:
				return "";
		}
	}
	return "No data available";
};

// const formatRevenuePerCustomer = (salesInfo) =>{
// 	if( salesInfo.totalRevenue.period ){
// 		let revenuePerCustomer = 0;
// 		switch( salesInfo.totalRevenue.period ){
// 			case "none":
// 				revenuePerCustomer = salesInfo.totalRevenue.total/salesInfo.customerCount;
// 				break;
// 			case "year":
// 			case "month":
// 				revenuePerCustomer = salesInfo.totalRevenue.periods[0].value/salesInfo.customerCount;
// 				break;
// 			default:
// 				revenuePerCustomer = 0;
// 		}
// 		return utilService.formatDollar( salesInfo.currencyUnits, revenuePerCustomer );
// 	}
// 	return "N/A";
// };

// const formatNoOfCustomers = (salesInfo) =>{
// 	if( salesInfo.totalRevenue.period ){
// 		return "For " + salesInfo.customerCount + " customers";
// 	}
// 	return "";
// };




// const formatLitersPerCustomer = litersPerCustomer =>{
// 	if( litersPerCustomer === "N/A"){
// 		return litersPerCustomer;
// 	}else{
// 		return String(parseFloat(litersPerCustomer.value.toFixed(0)));
// 	}
// };
// const formatLitersPerPeriod = litersPerCustomer =>{
// 	return "Liters/" + litersPerCustomer;
// };
// const formatCustomerGrowth = newCustomers =>{
// 	if( typeof newCustomers.periods[1].periodValue === "string" ||
// 		typeof newCustomers.periods[2].periodValue === "string"){
// 		return "N/A";
// 	}else{
// 		return ((newCustomers.periods[1].periodValue/newCustomers.periods[2].periodValue *100) -100).toFixed(2) + "%"
// 	}
// };


const calcChange = (salesInfo, now, last) => {
	if( !now  || !last ){
		return "N/A"
	}else{
		// Pro-rate the current period of it is incomplete
		let nowDate = new Date();
		switch( salesInfo.totalCustomers.period ){
			case "year":
				let periodYear = new Date(Date.parse(salesInfo.totalCustomers.periods[0].beginDate)).getFullYear();
				if( nowDate.getFullYear() === periodYear ){
					let start = new Date(periodYear, 0, 0);
					let diff = nowDate - start;
					let oneDay = 1000 * 60 * 60 * 24;
					let dayOfYear = Math.floor(diff / oneDay);

					now = ((365*now)/dayOfYear)
				}
				break;
			case "month":
			default:
				let period = new Date(Date.parse(salesInfo.totalCustomers.periods[0].beginDate));
				periodYear = period.getFullYear();
				let periodMonth = period.getMonth();
				if( nowDate.getFullYear() === periodYear && nowDate.getMonth() === periodMonth ) {
					let dayOfMonth = nowDate.getDate();
					let daysInMonth =  new Date(periodYear, periodMonth+1, 0).getDate(); // Note: this is a trick to get the last day of the month
					now = ((daysInMonth*now)/dayOfMonth)
				}
				break;
		}
		return ((now/last)*100 -100).toFixed(2) + "%";
	}

};
const calcColor = (now, last) => {
	if( !now  || !last){
		return "gray"
	}else{
		if(now > last ) return "green";
		else if(now < last ) return "red";
	}
	return "gray"
};

function mapStateToProps(state) {
	return {
		sales:state.sales,
		kiosk:state.kiosk,
		healthCheck: state.healthCheck,
		productsHash: productsHashSelector(state),
		usersHash: usersHashSelector(state)
	};
}

function mapDispatchToProps(dispatch) {
	return {
		salesActions: bindActionCreators(salesActions, dispatch),
		healthCheckActions: bindActionCreators(healthCheckActions, dispatch)
	};
}

export default withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(SemaSales));
