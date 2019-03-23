// Package image handles storing, resizing and retrieval of images
// Provides Store with Save and Load and one implementation on top of local file system.
// Service object encloses Store and add common methods, this is the one consumer should use
package image

//go:generate sh -c "mockgen -source=image.go -package=image > image_mock.go"

import (
	"context"
	"io"
	"log"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/pkg/errors"
)

// Store defines interface for saving and loading pictures.
// Declares two-stage save with commit
type Store interface {
	Save(fileName string, userID string, r io.Reader) (id string, err error) // get name and reader and returns ID of stored image
	Commit(id string) error                                                  // move image from staging to permanent
	Load(id string) (io.ReadCloser, int64, error)                            // load image by ID. Caller has to close the reader.
	Cleanup(ctx context.Context, ttl time.Duration) error                    // run removal loop for old images on staging
}

// Service extends Store with common functions needed for any store implementation
type Service struct {
	Store
	TTL      time.Duration // for how long file allowed on staging
	ImageAPI string        // image api matching path
}

// Submit multiple ids for delayed commit
func (s *Service) Submit(ids []string) {
	if len(ids) == 0 {
		return
	}

	time.AfterFunc(s.TTL, func() {
		for _, id := range ids {
			if err := s.Commit(id); err != nil {
				log.Printf("[WARN] failed to commit image %s", id)
			}
		}
	})
}

// ExtractPictures gets list of images from the doc html and convert from urls to ids, i.e. user/pic.png
func (s *Service) ExtractPictures(commentHTML string) (ids []string, err error) {

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(commentHTML))
	if err != nil {
		return nil, errors.Wrap(err, "can't create document")
	}
	result := []string{}
	doc.Find("img").Each(func(i int, sl *goquery.Selection) {
		if im, ok := sl.Attr("src"); ok {
			if strings.Contains(im, s.ImageAPI) {
				elems := strings.Split(im, "/")
				if len(elems) >= 2 {
					id := elems[len(elems)-2] + "/" + elems[len(elems)-1]
					result = append(result, id)
				}
			}
		}
	})

	return result, nil
}

// Cleanup runs periodic cleanup with TTL. Blocking loop, should be called inside of goroutine by consumer
func (s *Service) Cleanup(ctx context.Context) {
	log.Printf("[INFO] start pictures cleanup, staging ttl=%v", s.TTL)

	for {
		select {
		case <-ctx.Done():
			log.Printf("[INFO] cleanup terminated, %v", ctx.Err())
			return
		case <-time.After(s.TTL / 2):
			if err := s.Store.Cleanup(ctx, s.TTL); err != nil {
				log.Printf("[WARN] failed to cleanup, %v", err)
			}
		}
	}
}
