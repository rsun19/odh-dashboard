import * as React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { Select, SelectOption } from '@patternfly/react-core/deprecated';
import IndentSection from '~/pages/projects/components/IndentSection';

type EnvDataTypeFieldProps = {
  options: { [value: string]: { label: string; render: React.ReactNode } };
  selection: string;
  onSelection: (value: string) => void;
};

const EnvDataTypeField: React.FC<EnvDataTypeFieldProps> = ({ options, onSelection, selection }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Stack hasGutter>
      <StackItem data-testid="env-data-type-field">
        <Select
          isOpen={open}
          onToggle={() => setOpen(!open)}
          selections={selection}
          placeholderText="Select one"
          onSelect={(e, value) => {
            if (typeof value === 'string') {
              onSelection(value);
              setOpen(false);
            }
          }}
        >
          {Object.keys(options).map((option) => (
            <SelectOption key={option} value={option}>
              {options[option].label}
            </SelectOption>
          ))}
        </Select>
      </StackItem>
      {selection && (
        <StackItem>
          <IndentSection>{options[selection].render}</IndentSection>
        </StackItem>
      )}
    </Stack>
  );
};

export default EnvDataTypeField;
