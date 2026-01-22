export const dictionary = {
    en: {
        common: {
            appName: "Ondamed Support System",
            loading: "Loading...",
            save: "Save",
            cancel: "Cancel",
            saving: "Saving...",
            upload: "Upload PDF",
            uploading: "Uploading...",
            signingIn: "Signing in...",
            ok: "OK",
            error: "Error",
            unknownError: "Unknown error",
            accessDenied: "Access Denied",
        },
        auth: {
            signIn: "Sign in with Azure Entra ID",
            loginDev: "Development Mode Access",
        },
        nav: {
            chat: "Chat Assistant",
            documents: "Documents",
            settings: "Settings",
            signOut: "Sign out",
        },
        chat: {
            placeholder: "Ask a question about Ondamed usage or instructions...",
            contextActive: "Context Active",
            selectContext: "Select manuals...",
            noMessages: "No messages yet",
            disclaimer: "AI responses can be inaccurate. Always verify with official Ondamed manuals.",
            clearChat: "Clear Chat",
        },
        dashboard: {
            title: "Ondamed Assistant",
            subtitle: "Guidelines and instructions for the usage of the Ondamed treatment machine."
        },
        docs: {
            title: "Manuals & Protocols",
            description: "Manage Ondamed guidelines and instruction manuals available to the AI.",
            noDocs: "No documents uploaded yet",
            uploadedBy: "Uploaded by",
            uploadedOn: "on",
            pages: "pages",
            totalPages: "Total Pages",
            configure: "Configure",
            configTitle: "RAG Configuration",
            configDesc: "Define which pages the AI should reference or ignore.",
            boundaryAffect: "Boundaries affect AI answers immediately",
            from: "From",
            to: "To",
            include: "Include",
            exclude: "Exclude",
            rangeError: "Start page must be before end page",
            overlapError: "Range overlaps with another range",
            overlapErrorWith: "Overlaps with range #",
            outOfBoundsError: "Page must be within document range",
            pageMinError: "Page must be at least 1",
            pageMaxError: "Page cannot exceed",
            permUpload: "You don't have permission to upload documents",
            permEdit: "You don't have permission to modify boundaries",
            noBoundaries: "No custom boundaries set (Entire document included)",
        },
        login: {
            title: "Ondamed Support System",
            subtitle: "Guidelines and instructions for Ondamed specialized equipment",
            signInButton: "Continue with Microsoft Access",
            modeLabel: "Development Mode Access",
            copyright: "Ondamed Technical Support",
            roles: {
                admin: "Admin",
                doctor: "Doctor",
                staff: "Staff"
            }
        },
        selector: {
            placeholder: "Select manuals...",
            selected: "manual(s) selected",
            noDocs: "No manuals available"
        },
        bubble: {
            you: "You",
            assistant: "Ondamed Assistant",
            ref: "Ref"
        },
        settings: {
            title: "Settings",
            description: "Manage system preferences and connections.",
            backendTest: "Test Backend Connection",
            dbTest: "Test Database Connection",
            test: "Test Connection",
            testing: "Testing...",
            success: "Connection Successful",
            failure: "Connection Failed",
        }
    },
    th: {
        common: {
            appName: "ระบบสนับสนุน Ondamed",
            loading: "กำลังโหลด...",
            save: "บันทึก",
            cancel: "ยกเลิก",
            saving: "กำลังบันทึก...",
            upload: "อัปโหลด PDF",
            uploading: "กำลังอัปโหลด...",
            signingIn: "กำลังเข้าสู่ระบบ...",
            ok: "ตกลง",
            error: "ข้อผิดพลาด",
            unknownError: "ข้อผิดพลาดที่ไม่รู้จัก",
            accessDenied: "ปฏิเสธการเข้าถึง",
        },
        auth: {
            signIn: "เข้าสู่ระบบด้วย Azure Entra ID",
            loginDev: "โหมดนักพัฒนา",
        },
        nav: {
            chat: "ผู้ช่วยแชท",
            documents: "เอกสาร",
            settings: "ตั้งค่า",
            signOut: "ลงชื่อออก",
        },
        chat: {
            placeholder: "ถามคำถามเกี่ยวกับวิธีใช้งานหรือคำแนะนำ Ondamed...",
            contextActive: "ใช้งานบริบทคู่มือ",
            selectContext: "เลือกคู่มือประกอบการใช้งาน...",
            noMessages: "ยังไม่มีข้อความ",
            disclaimer: "คำตอบจาก AI อาจคลาดเคลื่อน โปรดตรวจสอบกับคู่มือ Ondamed อย่างเป็นทางการเสมอ",
            clearChat: "ล้างแชท",
        },
        dashboard: {
            title: "ผู้ช่วย Ondamed",
            subtitle: "แนวทางและคำแนะนำสำหรับการใช้งานเครื่องรักษา Ondamed"
        },
        docs: {
            title: "คู่มือและระเบียบการ",
            description: "จัดการคู่มือและระเบียบการ Ondamed สำหรับ AI",
            noDocs: "ยังไม่มีเอกสารอัปโหลด",
            uploadedBy: "อัปโหลดโดย",
            uploadedOn: "เมื่อ",
            pages: "หน้า",
            totalPages: "จำนวนหน้าทั้งหมด",
            configure: "ตั้งค่า",
            configTitle: "การตั้งค่า RAG",
            configDesc: "กำหนดหน้าที่ต้องการให้ AI อ้างอิงหรือยกเว้น",
            boundaryAffect: "การตั้งค่ามีผลต่อคำตอบ AI ทันที",
            from: "จาก",
            to: "ถึง",
            include: "รวม",
            exclude: "ยกเว้น",
            rangeError: "หน้าเริ่มต้นต้องมาก่อนหน้าสิ้นสุด",
            overlapError: "ช่วงหน้าซ้ำซ้อนกับรายการอื่น",
            overlapErrorWith: "ช่วงหน้าซ้ำซ้อนกับลำดับที่ ",
            outOfBoundsError: "เลขหน้าต้องอยู่ในช่วงของเอกสาร",
            pageMinError: "เลขหน้าต้องมีค่าอย่างน้อย 1",
            pageMaxError: "เลขหน้าต้องไม่เกิน",
            permUpload: "คุณไม่มีสิทธิ์อัปโหลดเอกสาร",
            permEdit: "คุณไม่มีสิทธิ์แก้ไขการตั้งค่า",
            noBoundaries: "ไม่มีการกำหนดขอบเขต (รวมทั้งเอกสาร)",
        },
        login: {
            title: "ระบบสนับสนุน Ondamed",
            subtitle: "คู่มือและคำแนะนำสำหรับอุปกรณ์เฉพาะทาง Ondamed",
            signInButton: "ดำเนินการต่อด้วย Microsoft Access",
            modeLabel: "เข้าใช้งานโหมดนักพัฒนา",
            copyright: "Ondamed Technical Support",
            roles: {
                admin: "ผู้ดูแลระบบ",
                doctor: "แพทย์",
                staff: "เจ้าหน้าที่"
            }
        },
        selector: {
            placeholder: "เลือกคู่มือ...",
            selected: "คู่มือที่เลือก",
            noDocs: "ไม่มีคู่มือ"
        },
        bubble: {
            you: "คุณ",
            assistant: "ผู้ช่วย Ondamed",
            ref: "อ้างอิง"
        },
        settings: {
            title: "ตั้งค่า",
            description: "จัดการการตั้งค่าระบบและการเชื่อมต่อ",
            backendTest: "ทดสอบการเชื่อมต่อ Backend",
            dbTest: "ทดสอบการเชื่อมต่อ Database",
            test: "ทดสอบการเชื่อมต่อ",
            testing: "กำลังทดสอบ...",
            success: "เชื่อมต่อสำเร็จ",
            failure: "การเชื่อมต่อล้มเหลว",
        }
    }
};

export type Language = "en" | "th";
export type Dictionary = typeof dictionary.en;
