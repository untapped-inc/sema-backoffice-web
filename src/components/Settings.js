import React, { Component } from 'react';
import { Formik, Form } from 'formik';
import '../App.css';
import '../css/Settings.css';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as healthCheckActions from '../actions/healthCheckActions';
import * as SettingsActions from '../actions/SettingsActions';
import { withRouter } from 'react-router';
import { ToastContainer, ToastStore } from 'react-toasts';

class Settings extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};

		this._getInitialValues = this._getInitialValues.bind(this);
	}

	componentDidMount() {
		this.props.settingsActions.fetchSettings();
	}

	render() {
		return (
			<div>
				<h2>General Settings</h2>

				<hr />

				{this.props.settings &&
					<Formik
						initialValues={this._getInitialValues()}
						onSubmit={(values, { setSubmitting }) => {
							this.props.settingsActions.updateSettings(values)
								.then(response => {
									setSubmitting(false);
									if (response.error) {
										return ToastStore.error(response.msg);
									}
									return ToastStore.success(response.msg);
								})
								.catch(err => {
									console.dir(err);
									return ToastStore.error("Something wrong happened");
								});
						}}
					>
						{({
							handleChange,
							submitForm,
							values
						}) => (
								<Form>
									{this.props.settings.map(settings => {

										let inputModifier;

										if (settings.name === 'default_unit_system') {
											inputModifier = <select
												onChange={async e => {
													await handleChange(e);
													submitForm();
												}}
												name="default_unit_system"
												value={values.default_unit_system}
											>
												<option value="metric">Metric</option>
												<option value="imperial">Imperial</option>
											</select>
										}

										return (
											// TODO: Turn this into a component
											<div className="settingsItem" key={settings.name}>
												<div className="settingsDetails">
													<span className="settingsTitle">{settings.title}</span>
													<span className="settingsDescription">{settings.description}</span>
												</div>

												{inputModifier}
											</div>
										);
									})}
								</Form>
							)
						}
					</Formik>
				}

				<ToastContainer position={ToastContainer.POSITION.BOTTOM_CENTER} store={ToastStore} />
			</div>
		);
	}

	_getInitialValues() {
		return this.props.settings.reduce((final, item) => {
			final[`${item.name}`] = item.value;
			return final;
		}, {});
	}
}

function mapStateToProps(state) {
	return {
		water: state.waterOperations,
		healthCheck: state.healthCheck,
		settings: state.settings
	};
}

function mapDispatchToProps(dispatch) {
	return {
		healthCheckActions: bindActionCreators(healthCheckActions, dispatch),
		settingsActions: bindActionCreators(SettingsActions, dispatch)
	};
}

export default withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(Settings));