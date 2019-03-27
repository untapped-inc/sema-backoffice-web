import React, { Component } from 'react';
import '../../App.css';
import SemaSummaryPanel1 from "./WaterOperations/SemaSummaryPanel1";
import SemaProductionChart from "./WaterOperations/SemaProductionChart";
import SemaChlorineChart from "./WaterOperations/SemaChlorineChart";
import SemaTDSChart from "./WaterOperations/SemaTDSChart";
import '../../css/SemaWaterOperations.css';
// import SeamaWaterQualityNavigation from "./WaterQuality/SeamaWaterQualityNavigation";
import SemaServiceError from "../SeamaServiceError";
import SemaDatabaseError from "../SeamaDatabaseError";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
	waterOperationsActions,
	healthCheckActions
} from '../../actions';
import * as settingsActions from '../../actions/SettingsActions';
import { withRouter } from 'react-router'
import SemaSummaryPanel2 from "./WaterOperations/SemaSummaryPanel2";
import LoadProgress from "../LoadProgress";
import { getSettingsItem } from '../../utils/functions';
import convert from 'convert-units';

class SemaWaterOperations extends Component {

	constructor(props) {
		super(props);

		this.defaultUnitSystem = getSettingsItem(this.props.settings || [], 'default_unit_system').value || '';

		this.literUnit = convert().describe('l');
		this.gallonUnit = convert().describe('gal');

		this.state = {
			waterUnit: this.defaultUnitSystem === 'imperial' ? this.gallonUnit : this.literUnit
		};

		this._getUnitMeasure = this._getUnitMeasure.bind(this);
	}

	render() {
		return this.showContent();
	}

	showContent(props) {
		if (this.props.healthCheck.server !== "Ok") {
			return SemaServiceError(props);
		} else if (this.props.healthCheck.database !== "Ok") {
			return SemaDatabaseError(props)
		}
		return this.showWaterOperations();

	}

	componentDidMount() {
		this.props.settingsActions.fetchSettings();
	}

	_getUnitMeasure(value) {
		if (value === 1) return this.state.waterUnit.singular.toLowerCase();
		return this.state.waterUnit.plural.toLowerCase();
	}

	showWaterOperations() {
		return (
			<React.Fragment>
				<div className="WaterSummaryProgress">
					<LoadProgress />
				</div>
				{this.props.settings && <div className="WaterOperationsContainer" style={this.getHeight()}>
					<div className="WaterSummaryContainer">
						<div className="WaterProduction">
							<div className="WaterSummaryItem">
								<SemaSummaryPanel1 title="Total Production" units={this._getUnitMeasure(this.props.water.waterOperationsInfo.totalProduction)}
									value={this.props.water.waterOperationsInfo.totalProduction}
									valueColor=""
									date={this.props.water.waterOperationsInfo.endDate} />
							</div>
						</div>
						<div className="WaterWastage">
							<div className="WaterSummaryItem">
								<SemaSummaryPanel1 title="Total Wastage" units={this._getUnitMeasure(this.calculateWastage())}
									value={this.calculateWastage()}
									valueColor="red"
									date={this.props.water.waterOperationsInfo.endDate} />
							</div>
						</div>
						<div className="WaterPressure">
							<div className="WaterSummaryItem2">
								<SemaSummaryPanel2 data={this.props.water.waterOperationsInfo} type="pressure" units={this.props.water.waterOperationsInfo.waterPressureUnits} />
							</div>
						</div>

						<div className="WaterFlow">
							<div className="WaterSummaryItem2">
								<SemaSummaryPanel2 data={this.props.water.waterOperationsInfo} type="flowrate" units={this.props.water.waterOperationsInfo.waterFlowrateUnits} />
							</div>
						</div>
					</div>
					{/*<div className ="WaterQualityNavigtionItem">*/}
					{/*<SeamaWaterQualityNavigation/>*/}
					{/*</div>*/}
					<div className="WaterChartContainer">
						<div className="WaterMainChartItem">
							<SemaProductionChart chartData={this.props.water.waterOperationsInfo.production} fillData={this.props.water.waterOperationsInfo.fill} />
						</div>
						<div className="WaterSecondaryChart1Item">
							<SemaChlorineChart chartData={this.props.water.waterOperationsInfo.chlorine} />
						</div>
						<div className="WaterSecondaryChart2Item">
							<SemaTDSChart chartData={this.props.water.waterOperationsInfo.tds} />
						</div>
					</div>
				</div>
				}
			</React.Fragment>
		);
	}
	calculateWastage() {
		if (!this.props.water.waterOperationsInfo.totalProduction ||
			!this.props.water.waterOperationsInfo.fillStation) {
			return null;
		} else {
			return this.props.water.waterOperationsInfo.totalProduction - this.props.water.waterOperationsInfo.fillStation;
		}
	}
	getHeight() {
		let windowHeight = window.innerHeight;
		// TODO 52px is the height of the toolbar. (Empirical)
		windowHeight -= 52;
		let height = windowHeight.toString() + 'px';
		return { height: height }
	}

}

function mapStateToProps(state) {
	return {
		water: state.waterOperations,
		healthCheck: state.healthCheck,
		kiosk: state.kiosk,
		settings: state.settings
	};
}

function mapDispatchToProps(dispatch) {
	return {
		waterOperationsActions: bindActionCreators(waterOperationsActions, dispatch),
		healthCheckActions: bindActionCreators(healthCheckActions, dispatch),
		settingsActions: bindActionCreators(settingsActions, dispatch)
	};
}

export default withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(SemaWaterOperations));

