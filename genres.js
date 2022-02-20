const clusters = `Crime,0.2999,0.1027,0.2241,0.0219
  Drama,1,0.324,0.0241,0.1103
  Fantasy,0.125,0.0784,0.0874,0.5622
  Horror,0.0578,0.0421,0.2473,0.0346
  Romance,0.2397,0.4037,0.0083,0.0785
  Comedy,0.0182,0.9994,0.0631,0.6709
  Thriller,0.3829,0.003,0.5724,0.0402
  Animation,0.0286,0.0343,0.051,0.6896
  Short,0,0.0005,0.0042,0.0449
  Family,0.0581,0.0786,0.0447,0.7795
  Mystery,0.1552,0.0022,0.2105,0.0623
  Action,0.2464,0.0999,0.5316,0.437
  Adventure,0.1298,0.0182,0.16,0.765
  Sci-Fi,0.0729,0.012,0.1859,0.2745
  Music,0.0276,0.0363,0.0407,0.0254
  Biography,0.1289,0.0143,0.0395,0.0003
  Sport,0.0834,0.0297,0.0219,0.031
  History,0.1024,0.0005,0.0207,0.0021
  War,0.0638,0.005,0.0294,0.0018
  Documentary,0.0156,0.0372,0.1454,0
  Film-Noir,0,0,0,0
  Musical,0.0045,0.0029,0.0001,0.0812
  Game-Show,0,0,0.014,0
  Western,0.0172,0.005,0.0122,0.0277
  Reality-TV,0,0.0038,0.0158,0
  Talk-Show,0,0.0043,0.0003,0
  News,0.0064,0,0.0196,0
  Adult,0,0,0.0002,0`
    .split('\n')
    .map(row => row.split(",").map(t => t.trim()))
    .map(([key, ...row]) => ({ [key]: row.map(Number.parseFloat) }))
    .reduce((acc, val) => ({ ...acc, ...val }))

const genre_cluster = (genres) => {
    const result = [0, 0, 0, 0]
    for (const genre of genres.split(",").map(x => x.trim())) {
        const values = clusters[genre]
        if (values) {
            for (const i in result) {
                result[i] += values[i]
            }
        }
    }
    const [max, cluster] = result.reduce(([max, i_max], val, i_val) => (val > max) ? [val, i_val] : [max, i_max], [0, NaN])
    return cluster
}
/*
test

[genre_cluster(""),
 genre_cluster("Fruta"), 
 genre_cluster("Crime"), 
 genre_cluster("Music"), 
 genre_cluster("Comedy"), 
 genre_cluster("Animation"),
 genre_cluster("Crime,Comedy")]
*/

module.exports = genre_cluster

/* alternative 
   const fixed_genre_cluster = (genres) => {
    if (genres) {
      const clusters = [
        new Set("Crime,Drama,Biography,Sport,History,War".split(",")),
        new Set("Romance,Comedy,Film-Noir,Talk-Show".split(",")),
        new Set("Horror,Thriller,Mystery,Action,Music,Documentary,Game-Show,Reality-TV,News,Adult".split(",")),
        new Set("Fantasy,Animation,Short,Family,Adventure,Sci-Fi,Musical,Western".split(","))
      ]
  
      const intersection_size = (a, s) => {
        return a.filter(x => s.has(x)).length
      }
  
      const genres_values = genres.split(",").map(text => text.trim())
      const [cluster,max_value] = (clusters
        .map((values,cluster) => [cluster, intersection_size(genres_values, values)])
        .reduce(([max_index, max_value], [curr_index, curr_val]) => 
                (curr_val > max_value)? [curr_index, curr_val] : [max_index,max_value]))
  
      return max_value>0?cluster:NaN
    }
    return NaN
  } */