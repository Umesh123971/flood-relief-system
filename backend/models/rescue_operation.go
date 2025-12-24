package models

import "time"

type RescueOperation struct {
	ID uint `gorm:"primaryKey" json:"id"`

	OperationName string `gorm:"size:255;not null" json:"operation_name"`

	HelpRequestID uint       `json:"help_request_id"`
	VolunteerID   uint       `json:"volunteer_id"`
	TeamSize      int        `gorm:"not null" json:"team_size"`
	VehicleType   string     `gorm:"size:50" json:"vehicle_type"`
	Location      string     `gorm:"size:255" json:"location"`
	StartTime     time.Time  `gorm:"not null" json:"start_time"`
	EndTime       *time.Time `json:"end_time,omitempty"`
	Status        string     `gorm:"size:20;default:'initiated'" json:"status"`
	Priority      string     `gorm:"size:20;default:'medium'" json:"priority"`
	PeopleRescued int        `gorm:"default:0" json:"people_rescued"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}
