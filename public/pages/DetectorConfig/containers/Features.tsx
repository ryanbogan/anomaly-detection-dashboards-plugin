/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
import React, { Component } from 'react';
import {
  EuiBasicTable,
  EuiText,
  EuiLink,
  EuiIcon,
  EuiButton,
  EuiEmptyPrompt,
  EuiSpacer,
} from '@elastic/eui';
import {
  Detector,
  FEATURE_TYPE,
  FeatureAttributes,
} from '../../../models/interfaces';
import { get, sortBy } from 'lodash';
import { PLUGIN_NAME, SHINGLE_SIZE } from '../../../utils/constants';
import ContentPanel from '../../../components/ContentPanel/ContentPanel';
import { CodeModal } from '../components/CodeModal/CodeModal';
import { getTitleWithCount } from '../../../utils/utils';

interface FeaturesProps {
  detectorId: string;
  detector: Detector;
  onEditFeatures(): void;
}

interface FeaturesState {
  showCodeModel: boolean[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

export class Features extends Component<FeaturesProps, FeaturesState> {
  constructor(props: FeaturesProps) {
    super(props);
    this.state = {
      showCodeModel: get(props.detector, 'featureAttributes', []).map(
        () => false
      ),
      sortField: 'name',
      sortDirection: 'asc',
    };
  }

  private closeModal(index: number) {
    const cloneShowCodeModal = [...this.state.showCodeModel];
    cloneShowCodeModal[index] = false;
    this.setState({
      showCodeModel: cloneShowCodeModal,
    });
  }

  private showModal(index: number) {
    const cloneShowCodeModal = [...this.state.showCodeModel];
    cloneShowCodeModal[index] = true;
    this.setState({
      showCodeModel: cloneShowCodeModal,
    });
  }

  private getModalVisibilityChange = (index: number) => {
    return this.state.showCodeModel[index];
  };

  private handleTableChange = (props: any) => {
    this.setState({
      sortField: props.sort.field,
      sortDirection: props.sort.direction,
    });
  };

  private sortedItems(items: Array<any>) {
    let sorted = sortBy(items, this.state.sortField);
    if (this.state.sortDirection == 'desc') {
      sorted = sorted.reverse();
    }
    return sorted;
  }

  public render() {
    const featureAttributes = get(this.props.detector, 'featureAttributes', []);
    const shingleSize = get(this.props.detector, 'shingleSize', SHINGLE_SIZE);

    const sorting = {
      sort: {
        field: this.state.sortField,
        direction: this.state.sortDirection,
      },
    };

    const items = featureAttributes.map(
      (feature: FeatureAttributes, index: number) => ({
        name: feature.featureName,
        definition: index,
        state: feature.featureEnabled ? 'Enabled' : 'Disabled',
      })
    );

    const sortedItems = this.sortedItems(items);

    const columns = [
      {
        field: 'name',
        name: 'Feature name',
        sortable: true,
      },
      {
        field: 'definition',
        name: 'Feature definition',
        render: (featureIndex: number) => {
          const feature = featureAttributes[featureIndex];

          const metaData = get(
            this.props.detector,
            `uiMetadata.features.${feature.featureName}`,
            {}
          );

          if (
            Object.keys(metaData).length === 0 ||
            metaData.featureType == FEATURE_TYPE.CUSTOM
          ) {
            return (
              <div>
                <p>
                  Custom expression:{' '}
                  <EuiLink
                    data-test-subj={`viewFeature-${featureIndex}`}
                    onClick={() => this.showModal(featureIndex)}
                  >
                    View code
                  </EuiLink>
                </p>

                {!this.getModalVisibilityChange(featureIndex) ? null : (
                  <CodeModal
                    code={JSON.stringify(feature.aggregationQuery, null, 4)}
                    title={feature.featureName}
                    subtitle="Custom expression"
                    closeModal={() => this.closeModal(featureIndex)}
                    getModalVisibilityChange={() =>
                      this.getModalVisibilityChange(featureIndex)
                    }
                  />
                )}
              </div>
            );
          } else {
            return (
              <div>
                <p>Field: {metaData.aggregationOf || ''}</p>
                <p>Aggregation method: {metaData.aggregationBy || ''}</p>
              </div>
            );
          }
        },
      },
      {
        field: 'state',
        name: 'Feature state',
      },
    ];

    const getCellProps = () => {
      return {
        textOnly: true,
      };
    };

    const featureNum = Object.keys(featureAttributes).length;

    const setParamsText = `Set the index fields that you want to find anomalies for by defining
                           the model features. You can also set other model parameters such as
                           window size.`

    const previewText = `After you set the model features and other optional parameters, you can
                         preview your anomalies from a sample feature output.`

    return (
      <ContentPanel
        title="Model configuration"
        titleSize="s"
        subTitle={
          <EuiText className="anomaly-distribution-subtitle">
            <p>
              {`${setParamsText} ${previewText} `}
              <EuiLink
                href="https://opendistro.github.io/for-elasticsearch-docs/docs/ad/"
                target="_blank"
              >
                Learn more &nbsp;
                <EuiIcon size="s" type="popout" />
              </EuiLink>
            </p>
          </EuiText>
        }
        actions={[
          <EuiButton onClick={this.props.onEditFeatures}>Edit</EuiButton>,
        ]}
      >
        {featureNum == 0 ? (
          <EuiEmptyPrompt
            title={
              <span className="emptyFeatureTitle">
                Model parameters are required to run a detector
              </span>
            }
            body={
              <EuiText className="emptyFeatureBody">
                {setParamsText}
                <br/>
                <br/>
                {previewText}
              </EuiText>
            }
            actions={[
              <EuiButton
                data-test-subj="createButton"
                href={`${PLUGIN_NAME}#/detectors/${this.props.detectorId}/features`}
                fill
              >
                Configure model
              </EuiButton>,
            ]}
          />
        ) : (
          <div>
            <ContentPanel
              title={getTitleWithCount('Features', featureNum)}
              titleSize="s"
            >
              <EuiBasicTable
                items={sortedItems}
                columns={columns}
                cellProps={getCellProps}
                sorting={sorting}
                onChange={this.handleTableChange}
              />
            </ContentPanel>
            <EuiSpacer size="m"/>
            <ContentPanel
              title="Additional settings"
              titleSize="s"
            >
              <EuiBasicTable
                className="header-single-value-euiBasicTable"
                items={[{ windowSize: shingleSize }]}
                columns={[{ field: 'windowSize', name: 'Window size'}]}
                cellProps={getCellProps}
              />
            </ContentPanel>
          </div>
        )}
      </ContentPanel>
    );
  }
}
