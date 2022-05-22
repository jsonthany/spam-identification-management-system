export const unsafeAttachmentTypes = [
    'ade','adp','apk','appx','appxbundle','bat','cab','chm','cmd','com','cpl','dll',
    'dmg','ex','ex_','exe','hta','ins','isp','iso','jar','js','jse','lib','lnk','mde',
    'msc','msi','msix','msixbundle','msp','mst','nsh','pif','ps1','scr','sct','shb',
    'sys','vb','vbe','vbs','vxd','wsc','wsf','wsh'
] as const;

export type UnsafeAttachmentTypes = typeof unsafeAttachmentTypes[number];