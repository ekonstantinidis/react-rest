import _ from 'underscore';
import React from 'react';
import superagent from 'superagent';

import RequestUtils from './src/utils/request';
import Request from './src/components/request';
import Response from './src/components/response';

export default class LiveAPIEndpoints extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      url: props.url,
      fields: props.fields || [],
      permissions: props.endpoint.permissions || [],
      selectedMethod: props.methods ? props.methods[0] : null,
      data: {},
      response: null
    };
  }

  addField(fieldName) {
    // Check if field already exists
    const fields = this.state.fields;
    if (_.findWhere(fields, {'name': fieldName})) { return; }

    fields.push({
      name: fieldName,
      required: false,
      type: 'text',
      isCustom: true
    });

    this.setState({
      fields: fields
    });
  }

  removeField(fieldName) {
    const fields = _.without(this.state.fields, _.findWhere(this.state.fields, {name: fieldName}));
    const data = _.omit(this.state.data, fieldName);

    this.setState({
      data: data,
      fields: fields
    });
  }

  handleDataFieldChange(value, fieldName) {
    const data = this.state.data;
    data[fieldName] = value;

    this.setState({
      data: data
    });
  }

  getData(method) {
    return RequestUtils.shouldIncludeData(method) ? (
      this.state.data
    ) : null;
  }

  makeRequest(event) {
    event.preventDefault();

    var self = this;
    const method = this.state.selectedMethod;

    // FIXME!
    const headers = {};
    // if (this.refs.request.state.headers.authorization) {
    //   headers['Authorization'] = this.refs.request.state.headers.authorization;
    // };

    // Now Make the Request
    superagent(method, this.state.url)
      .set(headers)
      .send(this.getData(method))
      .end(function (err, res) {
        self.setState({
          response: res
        });
      });
  }

  handleUrlChange(value) {
    this.setState({
      url: value
    });
  }

  selectMethod(value) {
    this.setState({
      selectedMethod: value
    });
  }

  render () {
    return (
      <form className="form-horizontal" onSubmit={(evt) => this.makeRequest(evt)}>
        <div className="modal-body">
          <div className="row">
            <Request
              url={this.state.url}
              onUrlChange={(value) => this.handleUrlChange(value)}
              permissions={this.state.permissions}
              fields={this.state.fields}
              handleFieldChange={(value, fieldName) => this.handleDataFieldChange(value, fieldName)}
              onAddField={(name) => this.addField(name)}
              onRemoveField={(name) => this.removeField(name)}
              methods={this.props.methods}
              selectedMethod={this.state.selectedMethod}
              onSelectMethod={(value) => this.selectMethod(value)} />

            <Response
              payload={this.state.response} />
          </div>

          <button type="submit" className="btn btn-primary">Send</button>
        </div>
      </form>
    );
  }
};

LiveAPIEndpoints.propTypes = {
  url: React.PropTypes.string.isRequired,
  methods: React.PropTypes.array.isRequired,
  fields: React.PropTypes.array.isRequired
};
