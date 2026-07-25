import { validateCorporateEmail } from './validateCorporateEmail';
import { toggleDomainStatus } from './toggleDomainStatus';
import { auditDomainChanges } from './auditLogs';
import { anonymizeUser } from './anonymizeUser';
import { forwardToSIEM } from './forwardToSIEM';

export {
    validateCorporateEmail,
    toggleDomainStatus,
    auditDomainChanges,
    anonymizeUser,
    forwardToSIEM
};
