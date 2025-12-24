package models

import "time"

type RescueOperation struct {

	//GORM tag is needed ONLY when you want special database behavior
	ID            uint       `gorm:"primaryKey" json:"id"`
	HelpRequestID uint       `json:"help_request_id"`
	VolunteerID   uint       `json:"volunteer_id"`
	TeamSize      int        `gorm:"not null" json:"team_size"`
	VehicleType   string     `gorm:"size:50" json:"vehicle_type"`
	Location      string     `gorm:"size:255" json:"location"`
	StartTime     time.Time  `gorm:"not null" json:"start_time"`
	EndTime       *time.Time `json:"end_time,omitempty"` //We need EndTime to sometimes have no value (mission not finished)
	Status        string     `gorm:"size:20;default:'initiated'" json:"status"`
	Priority      string     `gorm:"size:20;default:'medium'" json:"priority"`
	PeopleRescued int        `gorm:"default:0" json:"people_rescued"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}
