package models

import ( /*Time model uses timestamps.
	  Without it, Go cannot understand time.Time.*/
	"time"
)

type HelpRequest struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Phone       string    `gorm:"size:15;not null" json:"phone"`
	Location    string    `gorm:"size:255;not null" json:"location"`
	Description string    `gorm:"type:text" json:"description"`
	Priority    string    `json:"priority"`
	Status      string    `gorm:"size:20;default:'pending'" json:"status"` // pending, in-progress, completed
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
