from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(..., pattern="^(Admin|Manager|Procurement Officer|Vendor)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# --- Vendor Schemas ---
class VendorCreate(BaseModel):
    name: str = Field(..., min_length=2)
    category: str = Field(..., pattern="^(goods|services|construction|other)$")
    gst_number: Optional[str] = None
    contact_email: EmailStr
    status: Optional[str] = "active"
    phone: Optional[str] = None
    rating: Optional[str] = "3"

class VendorUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    gst_number: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    status: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[str] = None

class VendorResponse(BaseModel):
    id: int
    name: str
    category: str
    gst_number: Optional[str] = None
    contact_email: EmailStr
    status: str
    phone: Optional[str] = None
    rating: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- RFQ Schemas ---
class RfqCreate(BaseModel):
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    quantity: int = Field(..., gt=0)
    deadline: str  # e.g., YYYY-MM-DD
    status: Optional[str] = "active"

class RfqResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    quantity: int
    deadline: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Quotation Schemas ---
class QuotationCreate(BaseModel):
    price: float = Field(..., gt=0.0)
    delivery_days: int = Field(..., gt=0)
    notes: Optional[str] = None

class QuotationResponse(BaseModel):
    id: int
    rfq_id: int
    vendor_id: int
    price: float
    delivery_days: int
    notes: Optional[str] = None
    status: str
    created_at: datetime
    vendor: Optional[VendorResponse] = None
    name: str
    total_amount: float

    class Config:
        from_attributes = True

# --- Approval Schemas ---
class ApprovalUpdate(BaseModel):
    remarks: Optional[str] = None

class ApprovalResponse(BaseModel):
    id: int
    quotation_id: int
    approver_name: Optional[str] = None
    status: str
    remarks: Optional[str] = None
    date: datetime

    class Config:
        from_attributes = True

# --- Purchase Order Schemas ---
class PurchaseOrderCreate(BaseModel):
    quotation_id: int

class PurchaseOrderResponse(BaseModel):
    id: int
    po_number: str
    quotation_id: int
    vendor_id: int
    total_amount: float
    status: str
    order_date: str

    class Config:
        from_attributes = True

# --- Invoice Schemas ---
class InvoiceCreate(BaseModel):
    purchase_order_id: int

class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    purchase_order_id: int
    tax_amount: float
    total_amount: float
    status: str
    invoice_date: str

    class Config:
        from_attributes = True

# --- Analytics Schema ---
class AnalyticsResponse(BaseModel):
    total_vendors: int
    active_rfqs: int
    pending_approvals: int
    total_invoiced_value: float
