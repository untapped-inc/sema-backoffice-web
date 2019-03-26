import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PageHeader from 'react-bootstrap/lib/PageHeader';
import { isEmpty } from 'lodash';
import { RingLoader } from 'react-spinners';

import ProductForm from '../components/common/ProductForm';
import {
  getProduct,
  resetProduct,
  createProduct,
  updateProduct
} from '../actions/ProductActions';
import * as SettingsActions from '../actions/SettingsActions';
import { createLoadingSelector } from '../reducers/selectors';

const propTypes = {
  product: PropTypes.object
};
const defaultProps = {
  product: {}
};

class ProductDetails extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    if (id && id !== 'new') this.props.getProduct(id);

    this.props.settingsActions.fetchSettings();
  }

  render() {
    const { loading, selectedProduct } = this.props;
    const { name = '' } = selectedProduct;
    return (
      <div>
        {loading && (
          <div className="spinner">
            <RingLoader color="#36D7B7" />
          </div>
        )}
        {!loading && (
          <div>
            <PageHeader>{name || 'Create Product'}</PageHeader>
            {this.props.settings && (<ProductForm
              settings={this.props.settings}
              onSubmit={values =>
                isEmpty(selectedProduct)
                  ? this.props.createProduct(values)
                  : this.props.updateProduct(values)
              }
            />
            )}
          </div>
        )}
      </div>
    );
  }
}

ProductDetails.propTypes = propTypes;
ProductDetails.defaultProps = defaultProps;

const loadingSelector = createLoadingSelector(['GET_PRODUCT']);

const mapStateToProps = state => ({
  selectedProduct: state.selectedProduct,
  loading: loadingSelector(state),
  settings: state.settings
});

const mapDispatchToProps = dispatch => ({
  getProduct: bindActionCreators(getProduct, dispatch),
  resetProduct: dispatch(resetProduct()),
  createProduct: bindActionCreators(createProduct, dispatch),
  updateProduct: bindActionCreators(updateProduct, dispatch),
  settingsActions: bindActionCreators(SettingsActions, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductDetails);
