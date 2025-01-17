/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 *   Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import {
  displayText,
  isRangeOperator,
  isNullOperator,
  getOperators,
  validateStart,
  validateEnd,
} from '../helpers';
import { OPERATORS_MAP } from '../constant';
import { DATA_TYPES } from '../../../../../../utils/constants';

describe('whereHelpers', () => {
  describe('getOperators', () => {
    test('should return all supported number operators', () => {
      expect(getOperators(DATA_TYPES.NUMBER)).toEqual([
        {
          text: 'is',
          value: 'is',
        },
        {
          text: 'is not',
          value: 'is_not',
        },
        {
          text: 'is null',
          value: 'is_null',
        },
        {
          text: 'is not null',
          value: 'is_not_null',
        },
        {
          text: 'is greater than',
          value: 'is_greater',
        },
        {
          text: 'is greater than equal',
          value: 'is_greater_equal',
        },
        {
          text: 'is less than',
          value: 'is_less',
        },
        {
          text: 'is less than equal',
          value: 'is_less_equal',
        },
        {
          text: 'is in range',
          value: 'in_range',
        },
        {
          text: 'is not in range',
          value: 'not_in_range',
        },
      ]);
    });
    test('should return all supported text operators', () => {
      expect(getOperators(DATA_TYPES.TEXT)).toEqual([
        {
          text: 'is',
          value: 'is',
        },
        {
          text: 'is not',
          value: 'is_not',
        },
        {
          text: 'is null',
          value: 'is_null',
        },
        {
          text: 'is not null',
          value: 'is_not_null',
        },
        {
          text: 'starts with',
          value: 'starts_with',
        },
        {
          text: 'ends with',
          value: 'ends_with',
        },
        {
          text: 'contains',
          value: 'contains',
        },
        {
          text: 'does not contains',
          value: 'does_not_contains',
        },
      ]);
    });
    test('should return all supported keyword operators', () => {
      expect(getOperators(DATA_TYPES.KEYWORD)).toEqual([
        {
          text: 'is',
          value: 'is',
        },
        {
          text: 'is not',
          value: 'is_not',
        },
        {
          text: 'is null',
          value: 'is_null',
        },
        {
          text: 'is not null',
          value: 'is_not_null',
        },
        {
          text: 'starts with',
          value: 'starts_with',
        },
        {
          text: 'ends with',
          value: 'ends_with',
        },
        {
          text: 'contains',
          value: 'contains',
        },
      ]);
    });
    test('should return all supported boolean operators', () => {
      expect(getOperators(DATA_TYPES.BOOLEAN)).toEqual([
        {
          text: 'is',
          value: 'is',
        },
        {
          text: 'is not',
          value: 'is_not',
        },
        {
          text: 'is null',
          value: 'is_null',
        },
      ]);
    });
  });
  describe('isRangeOperator', () => {
    test('should return true  for IN_RANGE operator', () => {
      expect(isRangeOperator(OPERATORS_MAP.IN_RANGE)).toBe(true);
    });
    test('should return true  for NOT_IN_RANGE operator', () => {
      expect(isRangeOperator(OPERATORS_MAP.NOT_IN_RANGE)).toBe(true);
    });
    test('should return false for any other operators', () => {
      expect(isRangeOperator(OPERATORS_MAP.IS)).toBe(false);
      expect(isRangeOperator(OPERATORS_MAP.IS_GREATER_EQUAL)).toBe(false);
    });
  });

  describe('isNullOperator', () => {
    test('should return true for IS_NULL operator', () => {
      expect(isNullOperator(OPERATORS_MAP.IS_NULL)).toBe(true);
    });
    test('should return true  for IS_NOT_NULL operator', () => {
      expect(isNullOperator(OPERATORS_MAP.IS_NOT_NULL)).toBe(true);
    });
    test('should return false for any other operators', () => {
      expect(isNullOperator(OPERATORS_MAP.IS)).toBe(false);
      expect(isNullOperator(OPERATORS_MAP.IS_GREATER_EQUAL)).toBe(false);
    });
  });

  describe('displayText', () => {
    test('should return between and text for range operator', () => {
      expect(
        displayText({
          fieldInfo: [{ label: 'age', type: DATA_TYPES.NUMBER }],
          operator: OPERATORS_MAP.IN_RANGE,
          fieldRangeStart: 20,
          fieldRangeEnd: 40,
        })
      ).toBe('age is in range from 20 to 40');
    });
    test('should return between and text for not in range operator', () => {
      expect(
        displayText({
          fieldInfo: [{ label: 'age', type: DATA_TYPES.NUMBER }],
          operator: OPERATORS_MAP.NOT_IN_RANGE,
          fieldRangeStart: 20,
          fieldRangeEnd: 40,
        })
      ).toBe('age is not in range from 20 to 40');
    });
    test('should return text for null operators', () => {
      expect(
        displayText({
          fieldInfo: [{ label: 'age', type: DATA_TYPES.NUMBER }],
          operator: OPERATORS_MAP.IS_NULL,
        })
      ).toBe('age is null');
    });
    test('should return text for not null operators', () => {
      expect(
        displayText({
          fieldInfo: [{ label: 'age', type: DATA_TYPES.NUMBER }],
          operator: OPERATORS_MAP.IS_NOT_NULL,
        })
      ).toBe('age is not null');
    });
    test('should return text based on operator', () => {
      expect(
        displayText({
          fieldInfo: [{ label: 'age', type: DATA_TYPES.NUMBER }],
          operator: OPERATORS_MAP.IS_GREATER,
          fieldValue: 20,
        })
      ).toBe('age is greater than 20');
    });
  });

  describe('validateStart', () => {
    test('should return required if empty', () => {
      expect(validateStart('', 20)).toBe('Required');
    });
    test('should return required if undefined', () => {
      expect(validateStart(undefined, 20)).toBe('Required');
    });
    test('should return required if null', () => {
      expect(validateStart(null, 20)).toBe('Required');
    });
    test('should return error if start val = end val', () => {
      expect(validateStart(20, 20)).toBe('Start should be less than end');
    });
    test('should return error if start val > end val', () => {
      expect(validateStart(30, 20)).toBe('Start should be less than end');
    });
  });

  describe('validateEnd', () => {
    test('should return required if empty', () => {
      expect(validateEnd('', 20)).toBe('Required');
    });
    test('should return required if undefined', () => {
      expect(validateEnd(undefined, 20)).toBe('Required');
    });
    test('should return required if null', () => {
      expect(validateEnd(null, 20)).toBe('Required');
    });
    test('should return error if start val = end val', () => {
      expect(validateEnd(20, 20)).toBe('End should be greater than start');
    });
    test('should return error if start val > end val', () => {
      expect(validateEnd(20, 30)).toBe('End should be greater than start');
    });
  });
});
