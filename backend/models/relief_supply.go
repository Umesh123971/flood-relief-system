package models

import (
	"time"
)

type ReliefSupply struct {
	ID         uint       `gorm:"primaryKey" json:"id"`
	ItemName   string     `gorm:"size:100;not null" json:"item_name"`
	Category   string     `gorm:"size:50;not null" json:"category"`
	Quantity   int        `gorm:"not null" json:"quantity"`
	Unit       string     `gorm:"size:20;not null" json:"unit"`
	DonorName  string     `gorm:"size:100" json:"donor_name"`
	DonorPhone string     `gorm:"size:15" json:"donor_phone"`
	Location   string     `gorm:"size:255;not null" json:"location"`
	Status     string     `gorm:"size:20;default:'available'" json:"status"`
	ExpiryDate *time.Time `json:"expiry_date,omitempty"`
	Notes      string     `gorm:"type:text" json:"notes"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}
