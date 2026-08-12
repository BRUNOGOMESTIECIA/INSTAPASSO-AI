import { MotionPreferenceWidget } from './iso27001/MotionPreferenceWidget';
import { WafCorporateFilterWidget } from './iso27001/WafCorporateFilterWidget';
import { AntiBruteForcePanelWidget } from './iso27001/AntiBruteForcePanelWidget';
import { PasskeysFido2AdminWidget } from './iso27001/PasskeysFido2AdminWidget';
import { PasswordPolicyAdminWidget } from './iso27001/PasswordPolicyAdminWidget';
import { RateLimitingPanelWidget } from './iso27001/RateLimitingPanelWidget';
import { OperatorWorkScheduleWidget } from './iso27001/OperatorWorkScheduleWidget';
import { AgentPublicProfileAdminWidget } from './iso27001/AgentPublicProfileAdminWidget';
import { AiDuplicateDetectorAdminWidget } from './iso27001/AiDuplicateDetectorAdminWidget';
import { SecurityAuditLogsWidget } from './iso27001/SecurityAuditLogsWidget';
import { SessionTimeoutSettingsWidget } from './iso27001/SessionTimeoutSettingsWidget';
import { SessionCookiePolicyWidget } from './iso27001/SessionCookiePolicyWidget';
import { HttpSecurityHeadersWidget } from './iso27001/HttpSecurityHeadersWidget';

import { MultiDatabaseSeparationWidget } from './iso27001/MultiDatabaseSeparationWidget';
import { PwaOfflineSyncWidget } from './iso27001/PwaOfflineSyncWidget';
import { UnifiedUserCreationWidget } from './iso27001/UnifiedUserCreationWidget';
import { DirectInPlaceOperatorEditorWidget } from './iso27001/DirectInPlaceOperatorEditorWidget';
import { DepartmentCostCenterWidget } from './iso27001/DepartmentCostCenterWidget';
import { SoftDeleteRetentionWidget } from './iso27001/SoftDeleteRetentionWidget';
import { SiemLogMirrorWidget } from './iso27001/SiemLogMirrorWidget';
import { EncryptedBackupsAuditWidget } from './iso27001/EncryptedBackupsAuditWidget';
import { EncryptionComplianceWidget } from './iso27001/EncryptionComplianceWidget';
import { FileUploadSanitizerWidget } from './iso27001/FileUploadSanitizerWidget';
import { MfaPolicyEnforcementWidget } from './iso27001/MfaPolicyEnforcementWidget';
import { LogTtlPolicyWidget } from './iso27001/LogTtlPolicyWidget';
import { LgpdUserAnonymizationWidget } from './iso27001/LgpdUserAnonymizationWidget';
import { FrameAncestorsPolicyWidget } from './iso27001/FrameAncestorsPolicyWidget';

export default function SecurityGovernancePanel() {
  return (
    <div className="dark">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Coluna 1: Proteção Ativa, WAF e Logs */}
        <div className="space-y-6">
          <MotionPreferenceWidget />
          <WafCorporateFilterWidget />
          <AntiBruteForcePanelWidget />
          <PasskeysFido2AdminWidget />
          <PasswordPolicyAdminWidget />
          <RateLimitingPanelWidget />
          <OperatorWorkScheduleWidget />
          <AgentPublicProfileAdminWidget />
          <AiDuplicateDetectorAdminWidget />
          <SecurityAuditLogsWidget />
          <SessionTimeoutSettingsWidget />
          <SessionCookiePolicyWidget />
          <HttpSecurityHeadersWidget />
        </div>
        
        {/* Coluna 2: Governança, Compliance e Políticas */}
        <div className="space-y-6">
          <MultiDatabaseSeparationWidget />
          <PwaOfflineSyncWidget />
          <UnifiedUserCreationWidget />
          <DirectInPlaceOperatorEditorWidget />
          <DepartmentCostCenterWidget />
          <SoftDeleteRetentionWidget />
          <SiemLogMirrorWidget />
          <EncryptedBackupsAuditWidget />
          <EncryptionComplianceWidget />
          <FileUploadSanitizerWidget />
          <MfaPolicyEnforcementWidget />
          <LogTtlPolicyWidget />
          <LgpdUserAnonymizationWidget />
          <FrameAncestorsPolicyWidget />
        </div>
      </div>
    </div>
  );
}
