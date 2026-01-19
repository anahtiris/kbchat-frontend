export const dictionary = {
    en: {
        common: {
            loading: "Loading...",
            save: "Save",
            cancel: "Cancel",
            saving: "Saving...",
            upload: "Upload PDF",
            uploading: "Uploading...",
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
            placeholder: "Ask a question about the protocols...",
            contextActive: "Context Active",
            selectContext: "Select contexts...",
            noMessages: "No messages yet",
            disclaimer: "AI responses can be inaccurate. Always verify with official documents.",
            clearChat: "Clear Chat",
        },
        dashboard: {
            title: "Start a new session",
            subtitle: "Ask questions about clinic protocols, drug interactions, or uploaded guidelines."
        },
        docs: {
            title: "Knowledge Base",
            description: "Manage clinical guidelines and protocols available to the AI.",
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
            outOfBoundsError: "Page must be within document range",
            permUpload: "You don't have permission to upload documents",
            permEdit: "You don't have permission to modify boundaries",
        },
        login: {
            title: "Clinic Decision Support",
            subtitle: "Secure access for authorized personnel only",
            signInButton: "Continue with Microsoft Access",
            modeLabel: "Development Mode Access",
            copyright: "Internal Clinic Systems",
            roles: {
                admin: "Admin",
                doctor: "Doctor",
                staff: "Staff"
            }
        },
        selector: {
            placeholder: "Select contexts...",
            selected: "document(s) selected",
            noDocs: "No documents available"
        },
        bubble: {
            you: "You",
            assistant: "Clinic Assistant",
            ref: "Ref"
        }
    },
    th: {
        common: {
            loading: "กำลังโหลด...",
            save: "บันทึก",
            cancel: "ยกเลิก",
            saving: "กำลังบันทึก...",
            upload: "อัปโหลด PDF",
            uploading: "กำลังอัปโหลด...",
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
            placeholder: "ถามคำถามเกี่ยวกับระเบียบการรักษา...",
            contextActive: "ใช้งานบริบทเอกสาร",
            selectContext: "เลือกเอกสารอ้างอิง...",
            noMessages: "ยังไม่มีข้อความ",
            disclaimer: "คำตอบจาก AI อาจคลาดเคลื่อน โปรดตรวจสอบกับเอกสารต้นฉบับเสมอ",
            clearChat: "ล้างแชท",
        },
        dashboard: {
            title: "เริ่มเซสชันใหม่",
            subtitle: "ถามคำถามเกี่ยวกับระเบียบคลินิก ปฏิกิริยาระหว่างยา หรือแนวทางปฏิบัติที่อัปโหลด"
        },
        docs: {
            title: "ฐานข้อมูลความรู้",
            description: "จัดการแนวทางเวชปฏิบัติและระเบียบการสำหรับ AI",
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
            outOfBoundsError: "เลขหน้าต้องอยู่ในช่วงของเอกสาร",
            permUpload: "คุณไม่มีสิทธิ์อัปโหลดเอกสาร",
            permEdit: "คุณไม่มีสิทธิ์แก้ไขการตั้งค่า",
        },
        login: {
            title: "ระบบสนับสนุนการตัดสินใจทางคลินิก",
            subtitle: "เข้าใช้งานเฉพาะเจ้าหน้าที่ที่ได้รับอนุญาต",
            signInButton: "ดำเนินการต่อด้วย Microsoft Access",
            modeLabel: "เข้าใช้งานโหมดนักพัฒนา",
            copyright: "Internal Clinic Systems",
            roles: {
                admin: "ผู้ดูแลระบบ",
                doctor: "แพทย์",
                staff: "เจ้าหน้าที่"
            }
        },
        selector: {
            placeholder: "เลือกเอกสาร...",
            selected: "เอกสารที่เลือก",
            noDocs: "ไม่มีเอกสาร"
        },
        bubble: {
            you: "คุณ",
            assistant: "ผู้ช่วยคลินิก",
            ref: "อ้างอิง"
        }
    }
};

export type Language = "en" | "th";
export type Dictionary = typeof dictionary.en;
