import React, { Component } from 'react';
import { Formik, Form, Field } from 'formik';
import '../App.css';
import '../css/Settings.css';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as healthCheckActions from '../actions/healthCheckActions';
import { withRouter } from 'react-router';

class Settings extends Component {
	constructor(props) {
		super(props);

		this.state = {
        };
    }

	render() {
		return (
            <div>
                <h2>General Settings</h2>

                <hr />

                	<Formik
						initialValues={{ default_unit_system: 'metric' }}
						onSubmit={(values, { setSubmitting }) => {
							setTimeout(() => {
							alert(JSON.stringify(values, null, 2));
							setSubmitting(false);
							}, 400);
						}}
					>
						{({
							handleChange,
							submitForm
						}) => (
							<Form>
								<div className="settingsItem">
									<span>Default Unit System</span>

									<Field
										component="select"
										onChange={async e => {
											await handleChange(e);
											submitForm();
										}}
										name="default_unit_system">
										<option value="metric">Metric</option>
										<option value="imperial">Imperial</option>
									</Field>
								</div>
							</Form>
							)
						}
					</Formik>
            </div>
        );
	}

}

function mapStateToProps(state) {
	return {
		water: state.waterOperations,
		healthCheck: state.healthCheck
	};
}

function mapDispatchToProps(dispatch) {
	return {
		healthCheckActions: bindActionCreators(healthCheckActions, dispatch)
	};
}

export default withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(Settings));