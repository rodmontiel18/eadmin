import { createSelector } from '@reduxjs/toolkit';
import { Outcome } from '../../../models/outcome';
import { OutcomeGroup } from '../../../models/outcomeGroup/OutcomeGroup';
import { RootState } from '../../store';

const getOutcomeGroupState = (state: RootState) => state.outcomeGroup;

export const selectAction = createSelector(getOutcomeGroupState, o => o.action);

export const selectOutcome = createSelector(
  getOutcomeGroupState,
  p => p.outcome
);

export const selectOutcomeGroups = createSelector(getOutcomeGroupState, o => {
  const sortedGroups = (o.outcomeGroups ? [...o.outcomeGroups] : [])?.sort(
    (a: OutcomeGroup, b: OutcomeGroup) => a.name.localeCompare(b.name)
  );
  if (sortedGroups.length < 1) return undefined;
  return sortedGroups;
});

export const selectOutcomesByGroupId = (outcomeGroupId: string) =>
  createSelector(getOutcomeGroupState, p => {
    const filteredOutcomes = (p.outcomes ? [...p.outcomes] : [])
      ?.filter(o => o.groupId === outcomeGroupId)
      ?.sort(
        (a: Outcome, b: Outcome) =>
          (a?.outcomeDate?.unix() || 0) - (b?.outcomeDate?.unix() || 0)
      );
    if (filteredOutcomes.length < 1) return undefined;
    return filteredOutcomes;
  });

export const selectError = createSelector(getOutcomeGroupState, o => o.error);

export const selectOutcomeGroup = createSelector(
  getOutcomeGroupState,
  o => o.outcomeGroup
);

export const selectOutcomeGroupById = (outcomeGroupId: string) =>
  createSelector(getOutcomeGroupState, o =>
    o.outcomeGroups?.find(o => o.id === outcomeGroupId)
  );

export const selectRequestStatus = createSelector(
  getOutcomeGroupState,
  o => o.requestStatus
);
