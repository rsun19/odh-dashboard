import * as React from 'react';
import {
  DescriptionList,
  Divider,
  Flex,
  FlexItem,
  ContentVariants,
  Title,
  Bullseye,
  Spinner,
  Alert,
} from '@patternfly/react-core';
import { Link } from 'react-router';
import { ModelVersion } from '~/concepts/modelRegistry/types';
import DashboardDescriptionListGroup from '~/components/DashboardDescriptionListGroup';
import EditableTextDescriptionListGroup from '~/components/EditableTextDescriptionListGroup';
import { EditableLabelsDescriptionListGroup } from '~/components/EditableLabelsDescriptionListGroup';
import ModelPropertiesDescriptionListGroup from '~/pages/modelRegistry/screens/ModelPropertiesDescriptionListGroup';
import {
  getLabels,
  getProperties,
  isPipelineRunExist,
  mergeUpdatedLabels,
} from '~/pages/modelRegistry/screens/utils';
import useModelArtifactsByVersionId from '~/concepts/modelRegistry/apiHooks/useModelArtifactsByVersionId';
import { ModelRegistryContext } from '~/concepts/modelRegistry/context/ModelRegistryContext';
import ModelTimestamp from '~/pages/modelRegistry/screens/components/ModelTimestamp';
import { uriToStorageFields } from '~/concepts/modelRegistry/utils';
import InlineTruncatedClipboardCopy from '~/components/InlineTruncatedClipboardCopy';
import {
  bumpBothTimestamps,
  bumpRegisteredModelTimestamp,
} from '~/concepts/modelRegistry/utils/updateTimestamps';
import useRegisteredModelById from '~/concepts/modelRegistry/apiHooks/useRegisteredModelById';
import { globalPipelineRunDetailsRoute } from '~/routes';
import { ProjectObjectType, typedObjectImage } from '~/concepts/design/utils';
import { pipelineRunSpecificKeys } from './const';

type ModelVersionDetailsViewProps = {
  modelVersion: ModelVersion;
  isArchiveVersion?: boolean;
  refresh: () => void;
};

const ModelVersionDetailsView: React.FC<ModelVersionDetailsViewProps> = ({
  modelVersion: mv,
  isArchiveVersion,
  refresh,
}) => {
  const [modelArtifacts, modelArtifactsLoaded, modelArtifactsLoadError, refreshModelArtifacts] =
    useModelArtifactsByVersionId(mv.id);

  const modelArtifact = modelArtifacts.items.length ? modelArtifacts.items[0] : null;
  const { apiState } = React.useContext(ModelRegistryContext);
  const storageFields = uriToStorageFields(modelArtifact?.uri || '');
  const filteredProperties = getProperties(mv.customProperties);
  const [registeredModel, registeredModelLoaded, registeredModelLoadError, refreshRegisteredModel] =
    useRegisteredModelById(mv.registeredModelId);

  const loaded = modelArtifactsLoaded && registeredModelLoaded;
  const loadError = modelArtifactsLoadError || registeredModelLoadError;
  const refreshBoth = () => {
    refreshModelArtifacts();
    refreshRegisteredModel();
  };

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }
  const handleVersionUpdate = async (updatePromise: Promise<unknown>): Promise<void> => {
    await updatePromise;

    if (!mv.registeredModelId || !registeredModel) {
      return;
    }

    await bumpRegisteredModelTimestamp(apiState.api, registeredModel);
    refresh();
  };

  const handleArtifactUpdate = async (updatePromise: Promise<unknown>): Promise<void> => {
    try {
      await updatePromise;
      if (registeredModel) {
        await bumpBothTimestamps(apiState.api, registeredModel, mv);
        refreshBoth();
      }
    } catch (error) {
      throw new Error(
        `Failed to update artifact: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <Flex
      direction={{ default: 'column', md: 'row' }}
      columnGap={{ default: 'columnGap4xl' }}
      rowGap={{ default: 'rowGapLg' }}
    >
      <FlexItem flex={{ default: 'flex_1' }}>
        <DescriptionList isFillColumns>
          <EditableTextDescriptionListGroup
            editableVariant="TextArea"
            baseTestId="model-version-description"
            isArchive={isArchiveVersion}
            title="Description"
            contentWhenEmpty="No description"
            value={mv.description || ''}
            saveEditedValue={(value) =>
              handleVersionUpdate(apiState.api.patchModelVersion({}, { description: value }, mv.id))
            }
          />
          <EditableLabelsDescriptionListGroup
            labels={getLabels(mv.customProperties)}
            isArchive={isArchiveVersion}
            allExistingKeys={Object.keys(mv.customProperties)}
            title="Labels"
            contentWhenEmpty="No labels"
            onLabelsChange={(editedLabels) =>
              handleVersionUpdate(
                apiState.api.patchModelVersion(
                  {},
                  { customProperties: mergeUpdatedLabels(mv.customProperties, editedLabels) },
                  mv.id,
                ),
              )
            }
            data-testid="model-version-labels"
          />
          <ModelPropertiesDescriptionListGroup
            isArchive={isArchiveVersion}
            customProperties={mv.customProperties}
            saveEditedCustomProperties={(editedProperties) =>
              apiState.api
                .patchModelVersion({}, { customProperties: editedProperties }, mv.id)
                .then(refresh)
            }
          />
        </DescriptionList>
      </FlexItem>
      <FlexItem flex={{ default: 'flex_1' }}>
        <DescriptionList isFillColumns>
          <DashboardDescriptionListGroup
            title="Version ID"
            isEmpty={!mv.id}
            contentWhenEmpty="No model ID"
          >
            <InlineTruncatedClipboardCopy testId="model-version-id" textToCopy={mv.id} />
          </DashboardDescriptionListGroup>
          {isPipelineRunExist(mv.customProperties, pipelineRunSpecificKeys) && (
            <DashboardDescriptionListGroup title="Registered from">
              <Flex
                spaceItems={{ default: 'spaceItemsXs' }}
                alignItems={{ default: 'alignItemsCenter' }}
                data-testid="registered-from"
              >
                <FlexItem data-testid="pipeline-run-link">
                  Run{' '}
                  {
                    <Link
                      style={{ fontWeight: 'var(--pf-t--global--font--weight--body--bold)' }}
                      to={globalPipelineRunDetailsRoute(
                        filteredProperties[pipelineRunSpecificKeys[0]].string_value,
                        filteredProperties[pipelineRunSpecificKeys[1]].string_value,
                      )}
                    >
                      {filteredProperties[pipelineRunSpecificKeys[2]].string_value}
                    </Link>
                  }{' '}
                  in
                </FlexItem>
                <FlexItem style={{ display: 'flex' }}>
                  <img
                    style={{ height: 24 }}
                    src={typedObjectImage(ProjectObjectType.project)}
                    alt=""
                  />
                </FlexItem>
                <FlexItem
                  style={{
                    display: 'flex',
                    fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
                  }}
                >
                  {filteredProperties[pipelineRunSpecificKeys[0]].string_value}
                </FlexItem>
              </Flex>
            </DashboardDescriptionListGroup>
          )}
        </DescriptionList>

        <Title style={{ margin: '1em 0' }} headingLevel={ContentVariants.h3}>
          Model location
        </Title>
        {loadError ? (
          <Alert variant="danger" isInline title={loadError.name}>
            {loadError.message}
          </Alert>
        ) : (
          <>
            <DescriptionList>
              {storageFields?.s3Fields && (
                <>
                  <DashboardDescriptionListGroup
                    title="Endpoint"
                    isEmpty={!storageFields.s3Fields.endpoint}
                    contentWhenEmpty="No endpoint"
                  >
                    <InlineTruncatedClipboardCopy
                      testId="storage-endpoint"
                      textToCopy={storageFields.s3Fields.endpoint}
                    />
                  </DashboardDescriptionListGroup>
                  <DashboardDescriptionListGroup
                    title="Region"
                    isEmpty={!storageFields.s3Fields.region}
                    contentWhenEmpty="No region"
                  >
                    <InlineTruncatedClipboardCopy
                      testId="storage-region"
                      textToCopy={storageFields.s3Fields.region || ''}
                    />
                  </DashboardDescriptionListGroup>
                  <DashboardDescriptionListGroup
                    title="Bucket"
                    isEmpty={!storageFields.s3Fields.bucket}
                    contentWhenEmpty="No bucket"
                  >
                    <InlineTruncatedClipboardCopy
                      testId="storage-bucket"
                      textToCopy={storageFields.s3Fields.bucket}
                    />
                  </DashboardDescriptionListGroup>
                  <DashboardDescriptionListGroup
                    title="Path"
                    isEmpty={!storageFields.s3Fields.path}
                    contentWhenEmpty="No path"
                  >
                    <InlineTruncatedClipboardCopy
                      testId="storage-path"
                      textToCopy={storageFields.s3Fields.path}
                    />
                  </DashboardDescriptionListGroup>
                </>
              )}
              {storageFields?.uri ||
                (storageFields?.ociUri && (
                  <>
                    <DashboardDescriptionListGroup
                      title="URI"
                      isEmpty={!modelArtifact?.uri}
                      contentWhenEmpty="No URI"
                    >
                      <InlineTruncatedClipboardCopy
                        testId="storage-uri"
                        textToCopy={modelArtifact?.uri || ''}
                      />
                    </DashboardDescriptionListGroup>
                  </>
                ))}
            </DescriptionList>
            <Divider style={{ marginTop: '1em' }} />
            <Title style={{ margin: '1em 0' }} headingLevel={ContentVariants.h3}>
              Source model format
            </Title>
            <DescriptionList>
              <EditableTextDescriptionListGroup
                editableVariant="TextInput"
                baseTestId="source-model-format"
                isArchive={isArchiveVersion}
                value={modelArtifact?.modelFormatName || ''}
                saveEditedValue={(value) =>
                  handleArtifactUpdate(
                    apiState.api.patchModelArtifact(
                      {},
                      { modelFormatName: value },
                      modelArtifact?.id || '',
                    ),
                  )
                }
                title="Model Format"
                contentWhenEmpty="No model format specified"
              />
              <EditableTextDescriptionListGroup
                editableVariant="TextInput"
                baseTestId="source-model-version"
                value={modelArtifact?.modelFormatVersion || ''}
                isArchive={isArchiveVersion}
                saveEditedValue={(newVersion) =>
                  handleArtifactUpdate(
                    apiState.api.patchModelArtifact(
                      {},
                      { modelFormatVersion: newVersion },
                      modelArtifact?.id || '',
                    ),
                  )
                }
                title="Version"
                contentWhenEmpty="No source model format version"
              />
            </DescriptionList>
          </>
        )}
        <Divider style={{ marginTop: '1em' }} />
        <DescriptionList isFillColumns style={{ marginTop: '1em' }}>
          <DashboardDescriptionListGroup
            title="Author"
            popover="The author is the user who registered the model version."
          >
            {mv.author}
          </DashboardDescriptionListGroup>
          <DashboardDescriptionListGroup
            title="Last modified at"
            isEmpty={!mv.lastUpdateTimeSinceEpoch}
            contentWhenEmpty="Unknown"
          >
            <ModelTimestamp timeSinceEpoch={mv.lastUpdateTimeSinceEpoch} />
          </DashboardDescriptionListGroup>
          <DashboardDescriptionListGroup
            title="Registered"
            isEmpty={!mv.createTimeSinceEpoch}
            contentWhenEmpty="Unknown"
          >
            <ModelTimestamp timeSinceEpoch={mv.createTimeSinceEpoch} />
          </DashboardDescriptionListGroup>
        </DescriptionList>
      </FlexItem>
    </Flex>
  );
};
export default ModelVersionDetailsView;
