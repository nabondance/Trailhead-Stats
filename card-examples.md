# Card Examples

## Infinity

There's lots of combination of inputs possible to really build the card as you
want. You can find the available inputs in the
[README](README.md#card-features).

## Real world uses

Feel free to create a PR to add your personal example.

- [nabondance README.md](https://github.com/nabondance/nabondance/blob/master/README.md#--my-trailhead-stats)

## Examples

Bellow are some examples of inputs and the effect on the card. All examples have
the same data, the only difference is the inputs. Feel free to copy past the
inputs you like and customize them even further.

List of examples:

- [Default](#default)
- [Summary Only](#summary-only)
- [Focus on Certification](#focus-on-certification)
- [Numbers Lover](#numbers-lover)
- [Maxi Details](#maxi-details)
- [All over the table](#all-over-the-table)
- [Spooky](#spooky)
- [Up-to-date fan](#up-to-date-fan)

---

### Default

```yml
with:
  trailhead-username: th-username
  display-type: 'card'
```

| Card on Light Theme                                                    | Card on Dark Theme                                                     |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| <img src="images/examples/default-L.png" alt="default L" width="400"/> | <img src="images/examples/default-D.png" alt="default D" width="400"/> |

---

### Summary Only

```yml
with:
  trailhead-username: th-username
  display-type: 'card'
  showSkill: 'hidden'
  showCertification: 'hidden'
  showBadge: 'hidden'
  showSuperBadge: 'hidden'
  showEventBadge: 'hidden'
  showStamp: 'hidden'
  showCertificationLatest: 'hidden'
  showBadgeLatest: 'hidden'
  showSuperBadgeLatest: 'hidden'
  showEventBadgeLatest: 'hidden'
  showStampLatest: 'hidden'
```

| Card on Light Theme                                                    | Card on Dark Theme                                                     |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| <img src="images/examples/summary-L.png" alt="summary L" width="400"/> | <img src="images/examples/summary-D.png" alt="summary D" width="400"/> |

---

### Focus on Certification

```yml
with:
  trailhead-username: th-username
  display-type: 'card'
  showSkill: 'hidden'
  showCertification: 'detail'
  showBadge: 'hidden'
  showSuperBadge: 'hidden'
  showEventBadge: 'hidden'
  showStamp: 'hidden'
  showCertificationLatest: 'visible'
  showBadgeLatest: 'hidden'
  showSuperBadgeLatest: 'hidden'
  showEventBadgeLatest: 'hidden'
  showStampLatest: 'hidden'
```

| Card on Light Theme                                                  | Card on Dark Theme                                                   |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| <img src="images/examples/certif-L.png" alt="certif L" width="400"/> | <img src="images/examples/certif-D.png" alt="certif D" width="400"/> |

---

### Numbers Lover

```yml
with:
  trailhead-username: th-username
  display-type: 'card'
  showSkillNumber: 10
  showSkill: 'visible'
  showCertification: 'number'
  showBadge: 'number'
  showSuperBadge: 'number'
  showEventBadge: 'number'
  showStamp: 'number'
  showCertificationLatest: 'hidden'
  showBadgeLatest: 'hidden'
  showSuperBadgeLatest: 'hidden'
  showEventBadgeLatest: 'hidden'
  showStampLatest: 'hidden'
```

| Card on Light Theme                                                    | Card on Dark Theme                                                     |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| <img src="images/examples/numbers-L.png" alt="numbers L" width="400"/> | <img src="images/examples/numbers-D.png" alt="numbers D" width="400"/> |

---

### Maxi Details

```yml
with:
  trailhead-username: th-username
  display-type: 'card'
  showSkill: 'visible'
  showCertification: 'detail'
  showBadge: 'detail'
  showSuperBadge: 'detail'
  showEventBadge: 'detail'
  showStamp: 'detail'
  showCertificationLatest: 'hidden'
  showBadgeLatest: 'hidden'
  showSuperBadgeLatest: 'hidden'
  showEventBadgeLatest: 'hidden'
  showStampLatest: 'hidden'
```

| Card on Light Theme                                                     | Card on Dark Theme                                                      |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| <img src="images/examples/details-L.png" alt="details L" height="400"/> | <img src="images/examples/details-D.png" alt="details D" height="400"/> |

---

### All over the table

```yml
with:
  trailhead-username: th-username
  display-type: 'card'
  darkStyle: 'dark'
  showSkillNumber: 3
  showSkillTheme: 'olympic'
  showSkill: 'visible'
  showCertification: 'detail'
  showBadge: 'icon'
  showSuperBadge: 'icon'
  showEventBadge: 'icon'
  showStamp: 'icon'
  showCertificationLatest: 'hidden'
  showBadgeLatest: 'hidden'
  showSuperBadgeLatest: 'hidden'
  showEventBadgeLatest: 'hidden'
  showStampLatest: 'hidden'
```

| Card on Light Theme                                              | Card on Dark Theme                                               |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| <img src="images/examples/aott-L.png" alt="aott L" width="400"/> | <img src="images/examples/aott-D.png" alt="aott D" width="400"/> |

---

### Spooky

```yml
with:
  trailhead-username: th-username
  display-type: 'card'
  darkStyle: 'high-contrast'
  showSkillNumber: 6
  showSkillTheme: 'halloween'
  showSkill: 'visible'
  showCertification: 'detail'
  showBadge: 'hidden'
  showSuperBadge: 'icon'
  showEventBadge: 'hidden'
  showStamp: 'icon'
  showCertificationLatest: 'hidden'
  showBadgeLatest: 'hidden'
  showSuperBadgeLatest: 'hidden'
  showEventBadgeLatest: 'hidden'
  showStampLatest: 'hidden'
```

| Card on Light Theme                                                  | Card on Dark Theme                                                   |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| <img src="images/examples/spooky-L.png" alt="spooky L" width="400"/> | <img src="images/examples/spooky-D.png" alt="spooky D" width="400"/> |

---

### Up-to-date fan

```yml
with:
  trailhead-username: th-username
  display-type: 'card'
  showSkillTheme: 'winter'
  showSkill: 'visible'
  showCertification: 'detail'
  showBadge: 'hidden'
  showSuperBadge: 'icon'
  showEventBadge: 'icon'
  showStamp: 'icon'
  showCertificationLatest: 'visible'
  showBadgeLatest: 'visible'
  showSuperBadgeLatest: 'visible'
  showEventBadgeLatest: 'visible'
  showStampLatest: 'visible'
```

| Card on Light Theme                                                      | Card on Dark Theme                                                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| <img src="images/examples/uptodate-L.png" alt="uptodate L" width="400"/> | <img src="images/examples/uptodate-D.png" alt="uptodate D" width="400"/> |
