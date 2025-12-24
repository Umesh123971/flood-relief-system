package models

import "time"

//gorm -> connect Go structs → SQL database tables
//"id" -> we lastly use simple letters because JSON uses lowercase by convention
type Volunteer struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"size:100;not null" json:"name"`
	Email        string    `gorm:"size:100;unique; not null" json:"email"`
	Phone        string    `gorm:"size:15;not null" json:"phone"`
	Skills       string    `gorm:"type:text" json:"skills"`
	Availability string    `gorm:"size:100" json:"availability"`
	Location     string    `gorm:"size:255" json:"location"`
	Status       string    `gorm:"size:20;default:'active'" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
