package models

import "time"

type EmergencyContact struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	OrganizationName string    `gorm:"size:100;not null" json:"organization_name"` //Police, Hospital, Fire Dept
	ContactPerson    string    `gorm:"size:100" json:"contact_person"`
	Phone            string    `gorm:"size:15;not null" json:"phone"`
	AlternatePhone   string    `gorm:"size:100" json:"alternate_phone"`
	Email            string    `gorm:"size:100" json:"email"`
	Address          string    `gorm:"size:255" json:"address"`
	ServiceType      string    `gorm:"size:50" json:"service_type"` // Medical, Rescue, Food, Shelter
	IsActive         bool      `gorm:"default:true" json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
