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

    @property
    def name(self) -> str:
        return f"RFQ/2026/{str(self.id).zfill(5)}"

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

    @property
    def name(self) -> str:
        return f"QTN/2026/{str(self.id).zfill(5)}"

    @property
    def total_amount(self) -> float:
        qty = self.rfq.quantity if self.rfq else 1
        return self.price * qty

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
