# VendorBridge ERP - Summary of Changes (Full Lifecycle)

This document contains all the copy-pasteable code blocks for models, schemas, routing, and frontend files supporting the complete **VendorBridge Role Division & Document Lifecycle**:
- **Procurement Officer**: Create RFQs, Compare quotations, Generate POs, Generate invoices.
- **Vendor**: Submit quotations, Track RFQ status, View POs & Invoices.
- **Manager / Approver**: Approve/reject quotation requests, Monitor workflows.
- **Admin**: Manage users, Manage vendors, View global procurement analytics.

---

## 1. Database Models (`backend/models/models.py`)
Add this code to `backend/models/models.py`. It registers the `User`, `Vendor`, `RFQ`, `Quotation`, `Approval`, `PurchaseOrder`, and `Invoice` tables.

```python
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Admin, Manager, Procurement Officer, Vendor
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    category = Column(String, nullable=False)  # goods, services, construction, other
    gst_number = Column(String, unique=True, index=True, nullable=True)
    contact_email = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="active")  # active, inactive
    phone = Column(String, nullable=True)
    rating = Column(String, default="3")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RFQ(Base):
    __tablename__ = "rfqs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    quantity = Column(Integer, nullable=False)
    deadline = Column(String, nullable=False)  # Stored as string format e.g. YYYY-MM-DD
    status = Column(String, default="active")  # active, sent, received, closed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    quotations = relationship("Quotation", back_populates="rfq", cascade="all, delete-orphan")

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id", ondelete="CASCADE"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    price = Column(Float, nullable=False)
    delivery_days = Column(Integer, nullable=False)
    notes = Column(String, nullable=True)
    status = Column(String, default="under_review")  # under_review, approved, rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    rfq = relationship("RFQ", back_populates="quotations")
    vendor = relationship("Vendor")

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    approver_id = Column(Integer, nullable=True)
    approver_name = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, approved, rejected
    remarks = Column(String, nullable=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)

    quotation = relationship("Quotation")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String, unique=True, index=True, nullable=False)
    quotation_id = Column(Integer, ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="draft")  # draft, confirmed, done
    order_date = Column(String, nullable=False)  # YYYY-MM-DD

    quotation = relationship("Quotation")
    vendor = relationship("Vendor")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True, nullable=False)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False)
    tax_amount = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="draft")  # draft, open, paid, cancelled
    invoice_date = Column(String, nullable=False)  # YYYY-MM-DD

    purchase_order = relationship("PurchaseOrder")
```

---

## 2. Validation Schemas (`backend/schemas/schemas.py`)
Add this code to `backend/schemas/schemas.py`.

```python
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
```

---

## 3. Package Exports Settings

### `backend/models/__init__.py`
```python
from .models import User, Vendor, RFQ, Quotation, Approval, PurchaseOrder, Invoice
```

### `backend/schemas/__init__.py`
```python
from .schemas import (
    UserCreate, UserResponse, UserLogin, Token, TokenData,
    VendorCreate, VendorUpdate, VendorResponse,
    RfqCreate, RfqResponse,
    QuotationCreate, QuotationResponse,
    ApprovalUpdate, ApprovalResponse,
    PurchaseOrderCreate, PurchaseOrderResponse,
    InvoiceCreate, InvoiceResponse,
    AnalyticsResponse
)
```

---

## 4. Main Server Routes (`backend/app/main.py`)
Add this code to `backend/app/main.py`.

```python
import os
import datetime
from datetime import timedelta
from typing import List, Optional
import jwt
import bcrypt

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import local database connection & Base
from app.database import engine, Base, get_db

# Import models to ensure they are registered with Base before create_all
from models.models import User, Vendor, RFQ, Quotation, Approval, PurchaseOrder, Invoice

# Import validation schemas
from schemas.schemas import (
    UserCreate, UserResponse, UserLogin, Token, TokenData,
    VendorCreate, VendorUpdate, VendorResponse,
    RfqCreate, RfqResponse,
    QuotationCreate, QuotationResponse,
    ApprovalUpdate, ApprovalResponse,
    PurchaseOrderCreate, PurchaseOrderResponse,
    InvoiceCreate, InvoiceResponse,
    AnalyticsResponse
)

# Auto-create tables in the PostgreSQL database if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VendorBridge ERP API", version="1.0.0")

# CORS middleware config to allow Vite React frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY", "vendorbridge_secret_key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Security Helpers using native bcrypt package (avoids legacy passlib bugs on Python 3.14) ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Authentication Dependency ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=payload.get("role"))
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# --- Role Authorization Helper ---
def require_roles(allowed_roles: List[str]):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role}' is not authorized to access this resource. Allowed roles: {allowed_roles}"
            )
        return current_user
    return dependency

# --- Root Status Endpoint ---
@app.get("/")
def read_root():
    return {"status": "Backend is online and ready!"}

# =====================================================================
# 1. AUTHENTICATION & ADMIN ENDPOINTS
# =====================================================================

@app.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@app.post("/auth/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username is already registered.")
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered.")
    
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=Token)
@app.post("/auth/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    return db.query(User).all()

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    db.delete(user)
    db.commit()
    return None

@app.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Manager", "Procurement Officer"]))
):
    total_vendors = db.query(Vendor).count()
    active_rfqs = db.query(RFQ).filter(RFQ.status != "closed").count()
    pending_approvals = db.query(Approval).filter(Approval.status == "pending").count()
    total_invoiced_val = db.query(Invoice).filter(Invoice.status != "cancelled").with_entities(func.sum(Invoice.total_amount)).scalar() or 0.0
    return {
        "total_vendors": total_vendors,
        "active_rfqs": active_rfqs,
        "pending_approvals": pending_approvals,
        "total_invoiced_value": total_invoiced_val
    }

# =====================================================================
# 2. VENDOR MANAGEMENT ENDPOINTS (CRUD)
# =====================================================================

@app.post("/vendors", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
def create_vendor(
    vendor_in: VendorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Manager", "Procurement Officer"]))
):
    if db.query(Vendor).filter(Vendor.contact_email == vendor_in.contact_email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A vendor with this contact email is already registered.")
    if vendor_in.gst_number and db.query(Vendor).filter(Vendor.gst_number == vendor_in.gst_number).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A vendor with this GST number is already registered.")

    new_vendor = Vendor(**vendor_in.model_dump())
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return new_vendor

@app.get("/vendors", response_model=List[VendorResponse])
def list_vendors(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Manager", "Procurement Officer"]))
):
    return db.query(Vendor).all()

@app.get("/vendors/{vendor_id}", response_model=VendorResponse)
def read_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Manager", "Procurement Officer"]))
):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found.")
    return vendor

@app.put("/vendors/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    vendor_id: int,
    vendor_update: VendorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Manager", "Procurement Officer"]))
):
    db_vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not db_vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found.")
    
    update_data = vendor_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_vendor, key, value)
        
    db.commit()
    db.refresh(db_vendor)
    return db_vendor

@app.delete("/vendors/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Manager", "Procurement Officer"]))
):
    db_vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not db_vendor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found.")
    
    db.delete(db_vendor)
    db.commit()
    return None

# =====================================================================
# 3. RFQ MANAGEMENT ENDPOINTS
# =====================================================================

@app.post("/rfqs", response_model=RfqResponse, status_code=status.HTTP_201_CREATED)
def create_rfq(
    rfq_in: RfqCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Manager", "Procurement Officer"]))
):
    new_rfq = RFQ(**rfq_in.model_dump())
    db.add(new_rfq)
    db.commit()
    db.refresh(new_rfq)
    return new_rfq

@app.get("/rfqs", response_model=List[RfqResponse])
def list_active_rfqs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(RFQ).filter(RFQ.status != "closed").all()

@app.post("/rfqs/{rfq_id}/simulate-bids", response_model=List[QuotationResponse])
def simulate_bids(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Procurement Officer", "Manager"]))
):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found.")

    vendors = db.query(Vendor).filter(Vendor.status == "active").all()
    created_quotes = []

    import random
    for v in vendors:
        # Check if already bid
        existing = db.query(Quotation).filter(Quotation.rfq_id == rfq_id, Quotation.vendor_id == v.id).first()
        if existing:
            continue
        
        price = float(random.randint(900, 1300))
        new_quote = Quotation(
            rfq_id=rfq_id,
            vendor_id=v.id,
            price=price,
            delivery_days=random.randint(5, 15),
            notes=f"Automatic bid from {v.name}. Standard compliance offered.",
            status="under_review"
        )
        db.add(new_quote)
        db.commit()
        db.refresh(new_quote)

        # Trigger workflow approval
        new_approval = Approval(
            quotation_id=new_quote.id,
            status="pending",
            remarks="Automatic quotation review."
        )
        db.add(new_approval)
        db.commit()
        
        created_quotes.append(new_quote)
        
    # Update RFQ status to received
    rfq.status = "received"
    db.commit()
    
    return created_quotes

# =====================================================================
# 4. QUOTATION & WORKFLOW APPROVALS ENDPOINTS
# =====================================================================

@app.post("/rfqs/{rfq_id}/quotes", response_model=QuotationResponse, status_code=status.HTTP_201_CREATED)
def submit_quotation(
    rfq_id: int,
    quote_in: QuotationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Vendor"]))
):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found.")
    if rfq.status == "closed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot submit quotation for a closed RFQ.")

    vendor = db.query(Vendor).filter(Vendor.contact_email == current_user.email).first()
    if not vendor:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your user account is not linked to any registered Vendor.")

    existing_quote = db.query(Quotation).filter(Quotation.rfq_id == rfq_id, Quotation.vendor_id == vendor.id).first()
    if existing_quote:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already submitted a quotation for this RFQ.")

    new_quote = Quotation(
        rfq_id=rfq_id,
        vendor_id=vendor.id,
        price=quote_in.price,
        delivery_days=quote_in.delivery_days,
        notes=quote_in.notes,
        status="under_review"
    )
    db.add(new_quote)
    db.commit()
    db.refresh(new_quote)

    # Automatically trigger workflow approval request entry
    new_approval = Approval(
        quotation_id=new_quote.id,
        status="pending",
        remarks="Pending manager review."
    )
    db.add(new_approval)
    db.commit()

    return new_quote

@app.get("/rfqs/{rfq_id}/quotes", response_model=List[QuotationResponse])
def get_rfq_quotations(
    rfq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Manager", "Procurement Officer"]))
):
    rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
    if not rfq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RFQ not found.")

    return db.query(Quotation).filter(Quotation.rfq_id == rfq_id).all()

@app.get("/quotations", response_model=List[QuotationResponse])
def list_all_quotations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "Vendor":
        vendor = db.query(Vendor).filter(Vendor.contact_email == current_user.email).first()
        if not vendor:
            return []
        return db.query(Quotation).filter(Quotation.vendor_id == vendor.id).all()
    return db.query(Quotation).all()

@app.put("/quotations/{quotation_id}/approve", response_model=QuotationResponse)
def approve_quotation(
    quotation_id: int,
    approval_in: ApprovalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Manager", "Admin"]))
):
    qtn = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not qtn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found.")
    
    qtn.status = "approved"

    approval = db.query(Approval).filter(Approval.quotation_id == quotation_id).first()
    if approval:
        approval.status = "approved"
        approval.remarks = approval_in.remarks or "Quotation approved."
        approval.approver_name = current_user.username
        approval.date = datetime.datetime.utcnow()

    # Reject other bids and close RFQ automatically
    other_qtns = db.query(Quotation).filter(Quotation.rfq_id == qtn.rfq_id, Quotation.id != quotation_id).all()
    for other_q in other_qtns:
        other_q.status = "rejected"
        other_app = db.query(Approval).filter(Approval.quotation_id == other_q.id).first()
        if other_app:
            other_app.status = "rejected"
            other_app.remarks = "Other bid approved."
            other_app.date = datetime.datetime.utcnow()

    rfq = db.query(RFQ).filter(RFQ.id == qtn.rfq_id).first()
    if rfq:
        rfq.status = "closed"

    db.commit()
    db.refresh(qtn)
    return qtn

@app.put("/quotations/{quotation_id}/reject", response_model=QuotationResponse)
def reject_quotation(
    quotation_id: int,
    approval_in: ApprovalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Manager", "Admin"]))
):
    qtn = db.query(Quotation).filter(Quotation.id == quotation_id).first()
    if not qtn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found.")
    
    qtn.status = "rejected"

    approval = db.query(Approval).filter(Approval.quotation_id == quotation_id).first()
    if approval:
        approval.status = "rejected"
        approval.remarks = approval_in.remarks or "Quotation rejected by manager."
        approval.approver_name = current_user.username
        approval.date = datetime.datetime.utcnow()

    db.commit()
    db.refresh(qtn)
    return qtn

@app.get("/approvals", response_model=List[ApprovalResponse])
def get_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Admin", "Manager", "Procurement Officer"]))
):
    return db.query(Approval).all()

# =====================================================================
# 5. PURCHASE ORDERS ENDPOINTS
# =====================================================================

@app.post("/purchase-orders", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED)
def generate_purchase_order(
    po_in: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Procurement Officer"]))
):
    qtn = db.query(Quotation).filter(Quotation.id == po_in.quotation_id).first()
    if not qtn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found.")
    if qtn.status != "approved":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only generate PO for approved quotations.")

    po_count = db.query(PurchaseOrder).count()
    po_num = f"VB-PO/2026/{str(po_count + 1).zfill(5)}"
    qty = qtn.rfq.quantity if qtn.rfq else 1

    new_po = PurchaseOrder(
        po_number=po_num,
        quotation_id=qtn.id,
        vendor_id=qtn.vendor_id,
        total_amount=qtn.price * qty,
        status="draft",
        order_date=datetime.date.today().strftime("%Y-%m-%d")
    )
    db.add(new_po)
    db.commit()
    db.refresh(new_po)
    return new_po

@app.get("/purchase-orders", response_model=List[PurchaseOrderResponse])
def get_purchase_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "Vendor":
        vendor = db.query(Vendor).filter(Vendor.contact_email == current_user.email).first()
        if not vendor:
            return []
        return db.query(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor.id).all()
    return db.query(PurchaseOrder).all()

@app.put("/purchase-orders/{po_id}/confirm", response_model=PurchaseOrderResponse)
def confirm_purchase_order(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Procurement Officer", "Manager", "Admin"]))
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase Order not found.")
    
    po.status = "confirmed"
    db.commit()
    db.refresh(po)
    return po

# =====================================================================
# 6. INVOICES ENDPOINTS
# =====================================================================

@app.post("/invoices", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def generate_invoice(
    inv_in: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Procurement Officer"]))
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == inv_in.purchase_order_id).first()
    if not po:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase Order not found.")
    if po.status != "confirmed":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only generate invoice for confirmed purchase orders.")

    inv_count = db.query(Invoice).count()
    inv_num = f"VB-INV/2026/{str(inv_count + 1).zfill(5)}"
    tax = po.total_amount * 0.18  # 18% GST standard calculation
    total = po.total_amount + tax

    new_inv = Invoice(
        invoice_number=inv_num,
        purchase_order_id=po.id,
        tax_amount=tax,
        total_amount=total,
        status="draft",
        invoice_date=datetime.date.today().strftime("%Y-%m-%d")
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)
    return new_inv

@app.get("/invoices", response_model=List[InvoiceResponse])
def get_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "Vendor":
        vendor = db.query(Vendor).filter(Vendor.contact_email == current_user.email).first()
        if not vendor:
            return []
        return db.query(Invoice).join(PurchaseOrder).filter(PurchaseOrder.vendor_id == vendor.id).all()
    return db.query(Invoice).all()

@app.put("/invoices/{invoice_id}/post", response_model=InvoiceResponse)
def post_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Procurement Officer"]))
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")
    
    inv.status = "open"
    db.commit()
    db.refresh(inv)
    return inv

@app.put("/invoices/{invoice_id}/pay", response_model=InvoiceResponse)
def pay_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Procurement Officer"]))
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")
    
    inv.status = "paid"

    # Automatically complete/close the linked Purchase Order as well
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == inv.purchase_order_id).first()
    if po:
        po.status = "done"

    db.commit()
    db.refresh(inv)
    return inv
```

---

## 5. React Frontend: Signup Role Dropdown (`frontend/src/pages/Signup.jsx`)
Here is the updated React Signup component supporting role mapping.

```javascript
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Landmark } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Procurement Officer');
  const [error, setError] = useState('');
  const { signup } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    const res = await signup(name, email, password, role);
    if (res.success) {
      alert(`Account created successfully as ${role}! Redirecting to login.`);
      navigate('/login');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Landmark size={36} className="text-accent-blue" />
          </div>
          <h2>Create Account</h2>
          <p>Get started with VendorBridge ERP</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={18} />
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="john.doe@company.com"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>ERP Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="form-control"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '0.95rem',
                outline: 'none',
                marginTop: '0.25rem',
                cursor: 'pointer'
              }}
            >
              <option value="Admin">Admin</option>
              <option value="Procurement Officer">Procurement Officer</option>
              <option value="Vendor">Vendor</option>
              <option value="Manager">Manager / Approver</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }}>
            <User size={18} />
            <span>Create ERP Account</span>
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account? </span>
          <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
```
